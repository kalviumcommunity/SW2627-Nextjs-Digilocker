export function successResponse(data = {}, options = {}) {
  const normalizedOptions = typeof options === "number" ? { status: options } : options;
  const { status = 200, message } = normalizedOptions;

  if (status === 204) {
    return new Response(null, { status });
  }

  const body = { success: true };
  if (message) body.message = message;
  body.data = data;

  return Response.json(body, { status });
}