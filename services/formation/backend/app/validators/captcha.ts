import vine from '@vinejs/vine'

export const CaptchaSchema = vine
  .object({
    private: vine.string().minLength(10).maxLength(2048),
    public: vine.string().minLength(10).maxLength(2048),
  })
  .nullable()
