const Joi = require("joi");

const timeFormat = /^([1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/;

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    image: Joi.string().allow("", null),

    timings: Joi.object({
      opening: Joi.string().pattern(timeFormat).required()
        .messages({
          "string.pattern.base": `"opening" time must be in HH:MM AM/PM format (e.g., 9:30 AM)`,
        }),
      closing: Joi.string().pattern(timeFormat).required()
        .messages({
          "string.pattern.base": `"closing" time must be in HH:MM AM/PM format (e.g., 6:00 PM)`,
        }),
    }).required(),

  }).required(),
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required(),
  }).required(),
});
