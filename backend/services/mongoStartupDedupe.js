import mongoose from 'mongoose';

/**
 * Multiple orgs must not share the same Twilio WhatsApp sender (unique index).
 * Keeps one org per number (prefers non-"default" slug), $unset on others.
 */
export const dedupeOrganizationTwilioWhatsAppNumbers = async () => {
  const coll = mongoose.connection.collection('organizations');
  const dupes = await coll
    .aggregate([
      {
        $match: {
          twilioWhatsAppNumber: { $nin: [null, ''] },
        },
      },
      {
        $group: {
          _id: '$twilioWhatsAppNumber',
          docs: { $push: { id: '$_id', slug: '$slug' } },
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gt: 1 } } },
    ])
    .toArray();

  for (const group of dupes) {
    const docs = [...group.docs].sort((a, b) => {
      if (a.slug === 'default' && b.slug !== 'default') return 1;
      if (b.slug === 'default' && a.slug !== 'default') return -1;
      return String(a.id).localeCompare(String(b.id));
    });
    const keep = docs[0];
    const drop = docs.slice(1);
    for (const d of drop) {
      await coll.updateOne({ _id: d.id }, { $unset: { twilioWhatsAppNumber: '' } });
    }
    console.log(
      `[MongoDB] Deduped Twilio sender ${group._id}: kept org "${keep.slug}", cleared ${drop.length} duplicate(s)`
    );
  }
};
