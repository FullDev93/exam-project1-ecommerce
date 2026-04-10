import { API_BASE_URL } from './config.js';

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error('Invalid JSON response from server');
  }

  if (!response.ok) {
    const message = result?.errors?.[0]?.message || result?.message || 'API request failed';

    throw new Error(message);
  }

  return result.data;
}

export async function getProducts() {
  return await request('/online-shop');
}

export async function getProductById(id) {
  if (!id) {
    throw new Error('Product ID is required');
  }

  return await request(`/online-shop/${id}`);
}

export async function registerUser(name, email, password) {
  if (!name || !email || !password) {
    throw new Error('All fields are required');
  }

  return await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export async function loginUser(email, password) {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  return await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function createApiKey(token) {
  if (!token) {
    throw new Error('Token is required');
  }

  return await request('/auth/create-api-key', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
