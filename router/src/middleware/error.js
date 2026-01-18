export const errorMiddleware = async (c, next) => {
  try {
    await next()
  } catch (err) {
    return c.json(
      { error: err.message || 'Internal Server Error' },
      500
    )
  }
}
