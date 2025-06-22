import { supabase } from '../Supabase/supabaseClient.js';

export const submitReview = async (req, res) => {
  const { questId, reviewerId, reviewedId, rating, comment } = req.body;

  if (!questId || !reviewerId || !reviewedId || typeof rating !== 'number') {
    return res.status(400).json({ success: false, error: 'Missing or invalid fields.' });
  }

  // 1. Insert review
  const { error: reviewError } = await supabase.from('reviews').insert({
    quest_id: questId,
    reviewer_id: reviewerId,
    reviewed_id: reviewedId,
    rating,
    comment,
  });

  if (reviewError) {
    console.error('Review Insert Error:', reviewError.message);
    return res.status(500).json({ success: false, error: reviewError.message });
  }

  // 2. Fetch existing reputation
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('reputation_rating, reputation_count')
    .eq('id', reviewedId)
    .single();

  if (userError) {
    console.error('Fetch User Error:', userError.message);
    return res.status(500).json({ success: false, error: userError.message });
  }

  // 3. Calculate new average reputation
  const total = user.reputation_rating * user.reputation_count + rating;
  const newCount = user.reputation_count + 1;
  const newAverage = total / newCount;

  // 4. Update reviewed user's reputation
  const { error: updateError } = await supabase.from('users').update({
    reputation_rating: newAverage,
    reputation_count: newCount,
  }).eq('id', reviewedId);

  if (updateError) {
    console.error('Reputation Update Error:', updateError.message);
    return res.status(500).json({ success: false, error: updateError.message });
  }

  return res.status(200).json({ success: true, newRating: newAverage, totalReviews: newCount });
};
