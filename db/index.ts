// Mocked database connection for AI Studio environment
export function getDb() {
  const noOp = {
    findMany: async () => [],
    findFirst: async () => null,
    select: () => ({
      from: () => ({
        orderBy: () => [],
        where: () => ({
          limit: () => [],
        }),
      }),
    }),
    insert: () => ({
      values: async () => ({}),
    }),
    update: () => ({
      set: () => ({
        where: async () => ({}),
      }),
    }),
    delete: () => ({
      where: async () => ({}),
    }),
  };

  return noOp as unknown as Record<string, unknown>;
}
