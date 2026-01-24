export default defineEventHandler(() => {
  return {
    ok: true,
    service: 'wrPadi',
    timestamp: new Date().toISOString()
  }
})
