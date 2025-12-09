import { User, userInterfaces } from '../user';
import jwt from 'jsonwebtoken';
import { Socket } from 'socket.io';

export interface AuthenticatedSocket extends Socket {
  user?: userInterfaces.IUserDoc;
}

const authMiddleWareSocket = async (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
  try {
    // Check multiple possible locations for the token
    const authorization = 
      socket.handshake.auth?.['token'] || 
      socket.handshake.headers?.['token'] || 
      socket.handshake.headers?.['authorization'];
    
    console.log('Socket Connection Attempt:', {
      socketId: socket.id,
      hasToken: !!authorization,
      auth: socket.handshake.auth,
      headers: Object.keys(socket.handshake.headers || {}),
      query: socket.handshake.query
    });

    if (!authorization) {
      console.error('No authorization token found');
      return next(new Error('Authentication failed: No token provided'));
    }

    const jwtSecret = process.env['JWT_SECRET'];
    if (!jwtSecret) {
      console.error('JWT_SECRET not configured');
      return next(new Error('Server configuration error'));
    }

    // Remove 'Bearer ' prefix if present
    const token = authorization.toString().replace(/^Bearer\s+/i, '');
    
    const decoded = jwt.verify(token, jwtSecret) as any;
    console.log('Token decoded successfully:', { sub: decoded?.sub, type: decoded?.type });
    
    const currentUser = decoded?.sub ? { _id: decoded.sub } : decoded?.user;
    if (!currentUser || !currentUser._id) {
      console.error('Invalid token structure:', decoded);
      return next(new Error('Authentication failed: Invalid token structure'));
    }
    
    const user = await User.findById(currentUser._id);

    if (!user) {
      console.error('User not found:', currentUser._id);
      return next(new Error('Authentication failed: User not found'));
    }

    console.log('User authenticated successfully:', { userId: user._id, name: user.name });
    socket.user = user;
    next();
  } catch (error: any) {
    console.error('Socket authentication error:', {
      message: error.message,
      name: error.name,
      stack: error.stack?.split('\n')[0]
    });
    
    // Send more specific error messages
    if (error.name === 'JsonWebTokenError') {
      return next(new Error('Authentication failed: Invalid token'));
    } else if (error.name === 'TokenExpiredError') {
      return next(new Error('Authentication failed: Token expired'));
    } else {
      return next(new Error(`Authentication failed: ${error.message}`));
    }
  }
};

export default authMiddleWareSocket;
