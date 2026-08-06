const { createSubmissionHandler } = require('../lib/form-submission');

exports.config = {
  path: '/api/contact',
  rateLimit: {
    action: 'rate_limit',
    aggregateBy: 'ip',
    windowLimit: 5,
    windowSize: 600
  }
};

exports.handler = createSubmissionHandler({
  action: 'contact',
  table: 'messages',
  parseRecord: (body) => {
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const message = typeof body.body === 'string' ? body.body.trim() : '';

    if (!name || name.length > 80 || !email || email.length > 254 || !message || message.length > 2000) {
      return null;
    }

    return { name, email, body: message };
  }
});
