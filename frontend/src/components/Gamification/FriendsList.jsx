import React from 'react';

function FriendsList({ friends, onChallenge }) {
  return (
    <section className="friends-panel">
      <div className="panel-title">Friends</div>
      <div className="friends-grid">
        {friends.length === 0 ? (
          <div className="empty-state">No friends have joined yet.</div>
        ) : (
          friends.map((friend) => {
            const initials = friend.name
              ? friend.name
                  .split(' ')
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join('')
              : 'FR';

            return (
              <div key={friend.id} className="friend-card">
                <div className="friend-avatar">{initials}</div>
                <div className="friend-copy">
                  <div className="friend-name">{friend.name || friend.username}</div>
                  <div className="friend-points">{friend.points || 0} pts</div>
                </div>
                <button type="button" className="control-button accent" onClick={() => onChallenge(friend.id)}>
                  Challenge
                </button>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

export default FriendsList;
