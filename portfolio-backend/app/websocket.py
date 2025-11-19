"""
WebSocket server for real-time collaboration using Socket.IO
"""
import socketio
from typing import Dict, Set

sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*'
)

portfolio_rooms: Dict[str, Set[str]] = {}

@sio.event
async def connect(sid, environ):
    """Handle client connection"""
    print(f"Client connected: {sid}")
    await sio.emit('connection_established', {'sid': sid}, room=sid)

@sio.event
async def disconnect(sid):
    """Handle client disconnection"""
    print(f"Client disconnected: {sid}")
    for portfolio_id, users in portfolio_rooms.items():
        if sid in users:
            users.remove(sid)
            await sio.emit('user_left', {
                'user_id': sid,
                'portfolio_id': portfolio_id
            }, room=portfolio_id)

@sio.event
async def join_portfolio(sid, data):
    """Join a portfolio room for real-time updates"""
    portfolio_id = data.get('portfolio_id')
    user_info = data.get('user_info', {})
    
    if not portfolio_id:
        return
    
    await sio.enter_room(sid, portfolio_id)
    
    if portfolio_id not in portfolio_rooms:
        portfolio_rooms[portfolio_id] = set()
    portfolio_rooms[portfolio_id].add(sid)
    
    await sio.emit('user_joined', {
        'user_id': sid,
        'user_info': user_info,
        'portfolio_id': portfolio_id
    }, room=portfolio_id, skip_sid=sid)
    
    await sio.emit('portfolio_users', {
        'portfolio_id': portfolio_id,
        'users': list(portfolio_rooms[portfolio_id])
    }, room=sid)

@sio.event
async def leave_portfolio(sid, data):
    """Leave a portfolio room"""
    portfolio_id = data.get('portfolio_id')
    
    if not portfolio_id:
        return
    
    await sio.leave_room(sid, portfolio_id)
    
    if portfolio_id in portfolio_rooms and sid in portfolio_rooms[portfolio_id]:
        portfolio_rooms[portfolio_id].remove(sid)
    
    await sio.emit('user_left', {
        'user_id': sid,
        'portfolio_id': portfolio_id
    }, room=portfolio_id)

@sio.event
async def portfolio_update(sid, data):
    """Broadcast portfolio update to all users in the room"""
    portfolio_id = data.get('portfolio_id')
    update_type = data.get('type')
    update_data = data.get('data')
    
    if not portfolio_id:
        return
    
    await sio.emit('portfolio_updated', {
        'portfolio_id': portfolio_id,
        'type': update_type,
        'data': update_data,
        'updated_by': sid
    }, room=portfolio_id, skip_sid=sid)

@sio.event
async def cursor_move(sid, data):
    """Broadcast cursor position for collaborative editing"""
    portfolio_id = data.get('portfolio_id')
    position = data.get('position')
    field = data.get('field')
    
    if not portfolio_id:
        return
    
    await sio.emit('cursor_moved', {
        'user_id': sid,
        'portfolio_id': portfolio_id,
        'field': field,
        'position': position
    }, room=portfolio_id, skip_sid=sid)

socket_app = socketio.ASGIApp(sio)
