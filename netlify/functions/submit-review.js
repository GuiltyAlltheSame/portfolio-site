const { createSubmissionHandler } = require('../lib/form-submission');

exports.handler = createSubmissionHandler({
  action: 'review',
  table: 'reviews',
  parseRecord: (body) => {
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const comment = typeof body.comment === 'string' ? body.comment.trim() : '';
    const rating = Number(body.rating);

    if (!name || name.length > 30 || !comment || comment.length > 500 || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return null;
    }

    return { name, comment, rating, approved: false };
  }
});
