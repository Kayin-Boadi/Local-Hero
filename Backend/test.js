// test.js
import { config } from 'dotenv';
config();

import {
  createQuest,
  offerToHelp,
  getPendingOffersForQuest,
  approveHeroOffer,
  completeQuest,
} from './questController.js';

const requesterId = '45806deb-778b-497b-bd96-70335b8160a1'; // Replace with a real user ID
const heroId = '9b799ea2-9193-4cd0-9f97-240e0e999fd4';           // Replace with another user ID

let createdQuestId = null;

async function runTestFlow() {
  console.log('🎯 Step 1: Creating Quest...');
  await createQuest({
    title: 'Purge the Hoarder\'s Dungeon',
    description: 'Help organize a messy garage full of junk.',
    category: 'agility',
    difficulty: 'large',
    requesterId: requesterId,
  });

  // You'd normally fetch this from Supabase, but let's manually grab the latest quest by this user
  const res = await fetchLatestQuest(requesterId);
  if (!res) {
    console.error('❌ Could not fetch created quest');
    return;
  }
  createdQuestId = res.id;

  console.log('\n🧝 Step 2: Hero Offers to Help...');
  await offerToHelp({ heroId, questId: createdQuestId });

  console.log('\n🔍 Step 3: Requester Views Offers...');
  const pending = await getPendingOffersForQuest(createdQuestId);
  console.log('Pending Offers:', pending);

  if (pending.length === 0) {
    console.log('❌ No offers found.');
    return;
  }

  console.log('\n👑 Step 4: Requester Approves Hero...');
  await approveHeroOffer({ questId: createdQuestId, heroId });

  console.log('\n🏁 Step 5: Completing the Quest...');
  await completeQuest({ questId: createdQuestId, heroId });

  console.log('\n✅ Test Flow Complete.');
}

async function fetchLatestQuest(requesterId) {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  const { data, error } = await supabase
    .from('quests')
    .select('*')
    .eq('requester_id', requesterId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) return null;
  return data[0];
}

runTestFlow();
