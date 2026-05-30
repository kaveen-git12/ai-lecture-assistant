"""
Classroom Board Monitor
=======================
Monitors a live webcam feed and automatically captures photos of a classroom
board based on three triggers:

  1. Full Erase   — Board is wiped clean / significant content removed
  2. Slide Change — Projected slide or entire view changes completely
  3. New Content  — Text/drawings added or modified on the board

Change-detection uses frame differencing with stability checks so captures
only happen once motion has stopped (e.g. the teacher steps away).

Usage:
    python board_monitor.py [--save-dir C:/BoardCaptures] [--camera 0]

Controls (while the preview window is open):
    q / ESC  — Quit
    c        — Force a manual capture
    r        — Reset the reference frame
"""

import os
import sys
import time
import argparse
from datetime import datetime

import cv2
import numpy as np


# ──────────────────────────────────────────────
# Configuration defaults
# ──────────────────────────────────────────────
DEFAULT_SAVE_DIR = os.path.join(os.path.dirname(__file__), "..", "backend", "uploads", "board-captures")
DEFAULT_CAMERA_INDEX = 0

# Detection thresholds (fraction of total pixels, 0-1)
SLIDE_CHANGE_THRESHOLD = 0.50      # >50% pixels changed -> slide change
NEW_CONTENT_LOW = 0.02             # >2% pixels changed -> possible new content
NEW_CONTENT_HIGH = 0.20            # <20% pixels changed -> still "new content" range
FULL_ERASE_BRIGHTNESS_JUMP = 30    # Mean brightness increase for erase detection
FULL_ERASE_EDGE_DROP = 0.40        # Edge pixel count must drop by 40%+

# Stability / timing
STABILITY_FRAMES = 15              # Consecutive stable frames before capture
MOTION_PIXEL_THRESHOLD = 0.005     # <0.5% pixel diff = "stable"
PIXEL_DIFF_MAGNITUDE = 30          # Per-pixel intensity diff to count as changed
COOLDOWN_SECONDS = 3               # Min seconds between consecutive captures
CAPTURE_DELAY_FRAMES = 5           # Extra wait frames after stability before snap

# Preview window
WINDOW_NAME = "Board Monitor"
OVERLAY_FONT = cv2.FONT_HERSHEY_SIMPLEX


# ──────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────
def timestamp_str():
    """Return a filesystem-safe timestamp string."""
    return datetime.now().strftime("%Y-%m-%d_%H-%M-%S")


def preprocess(frame):
    """Convert to grayscale and blur to suppress noise."""
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (21, 21), 0)
    return blurred


def compute_diff_ratio(frame_a, frame_b, threshold=PIXEL_DIFF_MAGNITUDE):
    """Fraction of pixels whose intensity differs by more than *threshold*."""
    diff = cv2.absdiff(frame_a, frame_b)
    changed = np.count_nonzero(diff > threshold)
    total = frame_a.shape[0] * frame_a.shape[1]
    return changed / total if total > 0 else 0.0


def count_edges(gray_frame):
    """Return the number of edge pixels (Canny)."""
    edges = cv2.Canny(gray_frame, 50, 150)
    return np.count_nonzero(edges)


def save_image(frame, save_dir, trigger_type):
    """Save *frame* as a JPEG and return the filepath."""
    filename = f"{timestamp_str()}_{trigger_type}.jpg"
    filepath = os.path.join(save_dir, filename)
    cv2.imwrite(filepath, frame, [cv2.IMWRITE_JPEG_QUALITY, 90])
    return filepath


# ──────────────────────────────────────────────
# Trigger classification
# ──────────────────────────────────────────────
def classify_change(
    current_gray,
    reference_gray,
    last_saved_gray,
    ref_edge_count,
):
    """
    Compare *current_gray* against the reference frame and the last-saved
    frame and return one of:
        "slide_change"  — near-total change
        "full_erase"    — board wiped (brighter, fewer edges)
        "new_content"   — moderate localised change
        None            — no significant change detected
    """
    diff_ratio = compute_diff_ratio(current_gray, reference_gray)

    # ── Slide Change ──────────────────────────
    if diff_ratio >= SLIDE_CHANGE_THRESHOLD:
        return "slide_change", diff_ratio

    # Only consider erase / new-content if there IS a meaningful diff
    if diff_ratio < NEW_CONTENT_LOW:
        return None, diff_ratio

    # ── Full Erase ────────────────────────────
    brightness_now = float(np.mean(current_gray))
    brightness_ref = float(np.mean(reference_gray))
    brightness_jump = brightness_now - brightness_ref

    cur_edges = count_edges(current_gray)
    edge_drop = 1.0 - (cur_edges / ref_edge_count) if ref_edge_count > 0 else 0.0

    if brightness_jump >= FULL_ERASE_BRIGHTNESS_JUMP and edge_drop >= FULL_ERASE_EDGE_DROP:
        return "full_erase", diff_ratio

    # ── New Content ───────────────────────────
    if diff_ratio <= NEW_CONTENT_HIGH:
        # Compare against last *saved* frame to confirm real change
        if last_saved_gray is not None:
            saved_diff = compute_diff_ratio(current_gray, last_saved_gray)
            if saved_diff >= NEW_CONTENT_LOW:
                return "new_content", diff_ratio
        else:
            # No saved frame yet -> treat as new content
            return "new_content", diff_ratio

    return None, diff_ratio


# ──────────────────────────────────────────────
# Main loop
# ──────────────────────────────────────────────
def run_monitor(save_dir: str, camera_index: int):
    """Open the camera and begin the monitoring loop."""

    # Auto-create the output directory
    os.makedirs(save_dir, exist_ok=True)
    print(f"[INFO] Saving captures to: {os.path.abspath(save_dir)}")

    cap = cv2.VideoCapture(camera_index)
    if not cap.isOpened():
        print(f"[ERROR] Cannot open camera index {camera_index}")
        sys.exit(1)

    # Let the camera warm up
    print("[INFO] Warming up camera...")
    for _ in range(30):
        cap.read()
    time.sleep(0.5)

    # Read the first usable frame as our reference
    ret, frame = cap.read()
    if not ret:
        print("[ERROR] Failed to read initial frame")
        sys.exit(1)

    reference_gray = preprocess(frame)
    reference_edge_count = count_edges(reference_gray)
    last_saved_gray = None
    last_saved_filepath = None
    last_capture_time = 0.0

    stable_count = 0        # consecutive "stable" frames
    prev_gray = reference_gray.copy()
    status_text = "Initialising..."
    capture_pending = False  # True when stability reached, waiting extra frames
    pending_count = 0

    print("[INFO] Monitoring started. Press 'q' or ESC to quit.")

    while True:
        ret, frame = cap.read()
        if not ret:
            print("[WARN] Lost camera frame, retrying...")
            time.sleep(0.1)
            continue

        current_gray = preprocess(frame)
        now = time.time()

        # ── Step 1: motion / stability tracking ──
        motion_ratio = compute_diff_ratio(current_gray, prev_gray)
        is_stable = motion_ratio < MOTION_PIXEL_THRESHOLD

        if is_stable:
            stable_count += 1
        else:
            stable_count = 0
            capture_pending = False
            pending_count = 0

        prev_gray = current_gray.copy()

        # ── Step 2: once stable long enough, classify change ──
        if stable_count == STABILITY_FRAMES and not capture_pending:
            trigger, diff_ratio = classify_change(
                current_gray,
                reference_gray,
                last_saved_gray,
                reference_edge_count,
            )
            if trigger is not None:
                # Check cooldown
                if (now - last_capture_time) >= COOLDOWN_SECONDS:
                    capture_pending = True
                    pending_trigger = trigger
                    pending_count = 0
                    status_text = f"Change detected ({trigger}) - stabilising..."
                else:
                    remaining = COOLDOWN_SECONDS - (now - last_capture_time)
                    status_text = f"Cooldown ({remaining:.1f}s remaining)"
            else:
                status_text = "Stable - no significant change"

        # ── Step 3: extra delay then capture ──
        if capture_pending:
            pending_count += 1
            if pending_count >= CAPTURE_DELAY_FRAMES:
                # Re-read a fresh frame for the actual save
                ret, capture_frame = cap.read()
                if not ret:
                    capture_frame = frame

                trigger = pending_trigger

                if trigger == "new_content" and last_saved_filepath:
                    # Delete previous photo of same board state
                    try:
                        if os.path.exists(last_saved_filepath):
                            os.remove(last_saved_filepath)
                            print(f"[DEL]  Removed previous: {os.path.basename(last_saved_filepath)}")
                    except OSError as e:
                        print(f"[WARN] Could not delete old file: {e}")

                filepath = save_image(capture_frame, save_dir, trigger)
                last_saved_filepath = filepath
                last_saved_gray = preprocess(capture_frame)
                last_capture_time = time.time()

                # Update reference for erase / slide-change
                if trigger in ("slide_change", "full_erase"):
                    reference_gray = current_gray.copy()
                    reference_edge_count = count_edges(reference_gray)
                    last_saved_filepath = filepath  # new board state

                status_text = f"[OK] Captured: {os.path.basename(filepath)}"
                print(f"[SAVE] {trigger:14s} -> {filepath}")

                capture_pending = False
                pending_count = 0
                stable_count = 0

        # ── Step 4: draw overlay on preview ──
        display = frame.copy()
        overlay_h = 90
        overlay = display[:overlay_h, :]
        cv2.rectangle(display, (0, 0), (display.shape[1], overlay_h), (0, 0, 0), -1)
        cv2.addWeighted(overlay, 0.3, display[:overlay_h, :], 0.7, 0, display[:overlay_h, :])

        # Status line
        color = (0, 255, 120) if "[OK]" in status_text else (0, 200, 255)
        cv2.putText(display, status_text, (12, 30), OVERLAY_FONT, 0.6, color, 2)

        # Info line
        state_label = "STABLE" if is_stable else "MOTION"
        state_color = (0, 255, 0) if is_stable else (0, 0, 255)
        info = f"State: {state_label}  |  Stable: {stable_count}  |  Motion: {motion_ratio:.4f}"
        cv2.putText(display, info, (12, 60), OVERLAY_FONT, 0.45, state_color, 1)

        # Cooldown indicator
        elapsed = now - last_capture_time
        if last_capture_time > 0 and elapsed < COOLDOWN_SECONDS:
            cd_text = f"Cooldown: {COOLDOWN_SECONDS - elapsed:.1f}s"
            cv2.putText(display, cd_text, (12, 82), OVERLAY_FONT, 0.4, (100, 100, 255), 1)

        cv2.imshow(WINDOW_NAME, display)

        # ── Keyboard input ──
        key = cv2.waitKey(1) & 0xFF
        if key in (ord("q"), 27):  # q or ESC
            break
        elif key == ord("c"):
            # Manual capture
            filepath = save_image(frame, save_dir, "manual")
            last_saved_gray = preprocess(frame)
            last_saved_filepath = filepath
            last_capture_time = time.time()
            status_text = f"[OK] Manual capture: {os.path.basename(filepath)}"
            print(f"[SAVE] {'manual':14s} -> {filepath}")
        elif key == ord("r"):
            # Reset reference
            reference_gray = current_gray.copy()
            reference_edge_count = count_edges(reference_gray)
            stable_count = 0
            status_text = "Reference frame reset"
            print("[INFO] Reference frame reset by user")

    cap.release()
    cv2.destroyAllWindows()
    print("[INFO] Monitor stopped.")


# ──────────────────────────────────────────────
# Entry point
# ──────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Classroom Board Monitor — auto-captures board changes"
    )
    parser.add_argument(
        "--save-dir",
        default=DEFAULT_SAVE_DIR,
        help=f"Directory to save captured images (default: {DEFAULT_SAVE_DIR})",
    )
    parser.add_argument(
        "--camera",
        type=int,
        default=DEFAULT_CAMERA_INDEX,
        help=f"Camera device index (default: {DEFAULT_CAMERA_INDEX})",
    )
    args = parser.parse_args()

    run_monitor(save_dir=args.save_dir, camera_index=args.camera)
