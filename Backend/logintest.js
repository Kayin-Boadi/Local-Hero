import { signUpWithProfile } from './auth.js';

const email = 'Fletcher.lorenzoo@gmail.com';
const password = 'mypassword123';
const username = 'RequesterOfLights';
const avatarUrl = 'https://example.com/avatar.png'; // or empty string for default

await signUpWithProfile(email, password, username, avatarUrl);
