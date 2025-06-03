## API Integration

This project includes a configured Axios setup for API requests. The setup includes:

1. **Automatic Authorization Header**: JWT tokens from localStorage are automatically attached to requests
2. **Base URL Configuration**: API base URL is configured from environment variables
3. **Error Handling**: Common error scenarios (like 401 Unauthorized) are handled automatically
4. **TypeScript Support**: Full type safety for API requests and responses

### Directory Structure

```
src/
  services/
    api.ts               - Core axios instance setup
    apiClient.ts         - Wrapper functions for API calls
    authService.ts       - Authentication related operations
    index.ts             - Service exports
```

### Environment Variables

The API base URL is configured using environment variables. Create a `.env` file in the project root with:

```
VITE_API_URL=http://your-api-url.com/api
```

### Usage Examples

```typescript
// Import the API client
import { apiClient, authService } from '../services';

// Making API calls
const fetchData = async () => {
  try {
    // GET request
    const users = await apiClient.get('/users');
    
    // POST request with data
    const newUser = await apiClient.post('/users', { name: 'John', email: 'john@example.com' });
    
    // Authentication
    await authService.login({ username: 'user', password: 'pass' });
    const isLoggedIn = authService.isAuthenticated();
  } catch (error) {
    console.error('API error:', error);
  }
};
```
