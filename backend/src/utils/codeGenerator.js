/**
 * Generate a unique 5-character alphanumeric code
 * @param {Model} Model - Mongoose model to check uniqueness against
 * @param {string} field - Field name to check (e.g., 'projectCode' or 'productCode')
 * @returns {Promise<string>} - Unique 5-character code
 */
const generateUniqueCode = async (Model, field) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  let isUnique = false;

  while (!isUnique) {
    code = '';
    for (let i = 0; i < 5; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    // Check if code already exists
    const existing = await Model.findOne({ [field]: code });
    if (!existing) {
      isUnique = true;
    }
  }

  return code;
};

export default generateUniqueCode;
