// testBadges.js
import dotenv from 'dotenv';
//import { supabase } from '../Supabase/supabaseClient.js'
import { checkAndAwardBadges } from '../controllers/levelController.js'

dotenv.config();

const testUserId = '9b799ea2-9193-4cd0-9f97-240e0e999fd4'; // Replace with a valid user ID from your users table

async function runBadgeTest() {
  console.log(`Testing badge awarding for user: ${testUserId}`);

  const response = await checkAndAwardBadges({ params: { userId: testUserId } }, {
    status: (code) => ({
      json: (payload) => console.log(`Status ${code}:`, JSON.stringify(payload, null, 2))
    })
  });

  if (response?.error) {
    console.error('Badge awarding failed:', response.error);
  } else {
    console.log('Badge test complete.');
  }
}

runBadgeTest();
