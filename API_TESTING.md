# ShareBite API Testing Guide

This file contains curl commands and examples to test the ShareBite API endpoints.

## Setup

1. Ensure MongoDB is running
2. Start the backend server: `npm run dev`
3. Server should be running on `http://localhost:5000`

## Test Data

### Test Account 1 - Donor
```
Email: donor@test.com
Password: password123
Name: John Donor
Location: Downtown
```

### Test Account 2 - Receiver
```
Email: receiver@test.com
Password: password123
Name: Jane Receiver
Location: Downtown
```

## API Testing

### 1. Health Check
```bash
curl http://localhost:5000/api/health
```

Expected Response:
```json
{
  "message": "Server is running"
}
```

### 2. Register User

**Register as Donor:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Donor",
    "email": "donor@test.com",
    "password": "password123",
    "role": "donor",
    "location": "Downtown"
  }'
```

**Register as Receiver:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Receiver",
    "email": "receiver@test.com",
    "password": "password123",
    "role": "receiver",
    "location": "Downtown"
  }'
```

Expected Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "John Donor",
    "email": "donor@test.com",
    "role": "donor",
    "location": "Downtown"
  }
}
```

### 3. Login User

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "donor@test.com",
    "password": "password123"
  }'
```

Expected Response: Same as registration, includes `token`

**Save the token for subsequent requests!**

### 4. Get User Profile

```bash
# Replace TOKEN with actual JWT token
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer TOKEN"
```

### 5. Update User Profile

```bash
curl -X PUT http://localhost:5000/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "name": "John Donor Updated",
    "location": "Downtown Area",
    "rating": 5
  }'
```

### 6. Add Food (Donor Only)

```bash
curl -X POST http://localhost:5000/api/foods \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer DONOR_TOKEN" \
  -d '{
    "title": "Homemade Pizza",
    "description": "Fresh pizza with vegetables and cheese",
    "quantity": "2 large pizzas",
    "vegType": "veg",
    "expiryTime": "2024-02-08T20:00:00",
    "location": "Downtown Street, Park"
  }'
```

Expected Response:
```json
{
  "success": true,
  "message": "Food listing created successfully",
  "food": {
    "_id": "...",
    "title": "Homemade Pizza",
    "description": "Fresh pizza with vegetables and cheese",
    "quantity": "2 large pizzas",
    "vegType": "veg",
    "expiryTime": "2024-02-08T20:00:00.000Z",
    "location": "Downtown Street, Park",
    "donorId": "...",
    "status": "available",
    "createdAt": "2024-02-07T...",
    "updatedAt": "2024-02-07T..."
  }
}
```

### 7. Get All Foods

```bash
curl -X GET http://localhost:5000/api/foods
```

Expected Response:
```json
{
  "success": true,
  "count": 1,
  "foods": [
    {
      "_id": "...",
      "title": "Homemade Pizza",
      ...
    }
  ]
}
```

### 8. Get Single Food

```bash
# Replace FOOD_ID with actual food ID
curl -X GET http://localhost:5000/api/foods/FOOD_ID
```

### 9. Get My Food Listings (Donor)

```bash
curl -X GET http://localhost:5000/api/foods/donor/my-foods \
  -H "Authorization: Bearer DONOR_TOKEN"
```

### 10. Update Food (Donor Only)

```bash
curl -X PUT http://localhost:5000/api/foods/FOOD_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer DONOR_TOKEN" \
  -d '{
    "title": "Homemade Pizza - Updated",
    "description": "Fresh pizza with vegetables and extra cheese",
    "quantity": "3 large pizzas",
    "vegType": "veg"
  }'
```

### 11. Delete Food (Donor Only)

```bash
curl -X DELETE http://localhost:5000/api/foods/FOOD_ID \
  -H "Authorization: Bearer DONOR_TOKEN"
```

### 12. Create Food Request (Receiver Only)

```bash
curl -X POST http://localhost:5000/api/requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer RECEIVER_TOKEN" \
  -d '{
    "foodId": "FOOD_ID"
  }'
```

Expected Response:
```json
{
  "success": true,
  "message": "Request created successfully",
  "foodRequest": {
    "_id": "...",
    "foodId": "FOOD_ID",
    "receiverId": "...",
    "donorId": "...",
    "status": "pending",
    "createdAt": "2024-02-07T...",
    "updatedAt": "2024-02-07T..."
  }
}
```

### 13. Get My Requests (Receiver)

```bash
curl -X GET http://localhost:5000/api/requests/receiver/my-requests \
  -H "Authorization: Bearer RECEIVER_TOKEN"
```

### 14. Get Incoming Requests (Donor)

```bash
curl -X GET http://localhost:5000/api/requests/donor/my-requests \
  -H "Authorization: Bearer DONOR_TOKEN"
```

### 15. Accept Request (Donor Only)

```bash
curl -X PATCH http://localhost:5000/api/requests/REQUEST_ID/accept \
  -H "Authorization: Bearer DONOR_TOKEN"
```

Expected Response:
```json
{
  "success": true,
  "message": "Request accepted successfully",
  "request": {
    "_id": "...",
    "status": "accepted",
    ...
  }
}
```

### 16. Reject Request (Donor Only)

```bash
curl -X PATCH http://localhost:5000/api/requests/REQUEST_ID/reject \
  -H "Authorization: Bearer DONOR_TOKEN"
```

### 17. Cancel Request (Receiver Only)

```bash
curl -X DELETE http://localhost:5000/api/requests/REQUEST_ID/cancel \
  -H "Authorization: Bearer RECEIVER_TOKEN"
```

## Error Responses

### Invalid Credentials
```json
{
  "message": "Invalid email or password"
}
```

### Missing Authorization
```json
{
  "message": "Not authorized to access this route"
}
```

### Unauthorized Action
```json
{
  "message": "Only donors can perform this action"
}
```

### Validation Error
```json
{
  "message": "Please fill all the fields"
}
```

## Testing Flow

1. **Register Donor Account**
   ```bash
   POST /api/auth/register (as donor)
   ```

2. **Login as Donor**
   ```bash
   POST /api/auth/login
   # Save the token
   ```

3. **Add Food**
   ```bash
   POST /api/foods (with donor token)
   # Save the food ID
   ```

4. **Register Receiver Account**
   ```bash
   POST /api/auth/register (as receiver)
   ```

5. **Login as Receiver**
   ```bash
   POST /api/auth/login
   # Save the receiver token
   ```

6. **View Available Foods**
   ```bash
   GET /api/foods
   ```

7. **Request Food**
   ```bash
   POST /api/requests (with receiver token, use food ID from step 3)
   # Save the request ID
   ```

8. **View Pending Requests (as Donor)**
   ```bash
   GET /api/requests/donor/my-requests (with donor token)
   ```

9. **Accept Request**
   ```bash
   PATCH /api/requests/{REQUEST_ID}/accept (with donor token)
   ```

10. **Verify Request Status (as Receiver)**
    ```bash
    GET /api/requests/receiver/my-requests (with receiver token)
    ```

## Using Postman

1. Import the API into Postman
2. Create environment variables:
   - `BASE_URL` = http://localhost:5000/api
   - `DONOR_TOKEN` = [token from donor login]
   - `RECEIVER_TOKEN` = [token from receiver login]
   - `FOOD_ID` = [food ID created]
   - `REQUEST_ID` = [request ID created]

3. Use `{{BASE_URL}}` in requests
4. Use `Bearer {{DONOR_TOKEN}}` in Authorization headers

## Common Issues

### 401 Unauthorized
- Token may have expired
- Token is invalid or malformed
- Authorization header format is incorrect (should be: `Bearer TOKEN`)

### 403 Forbidden
- User doesn't have required role for the action
- Only donors can add food
- Only receivers can request food

### 404 Not Found
- Resource doesn't exist
- Food or request ID is incorrect

### 400 Bad Request
- Missing required fields
- Invalid data format
- Business logic violation (e.g., requesting unavailable food)

---

**Happy Testing! 🧪**
