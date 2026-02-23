// Mock Supabase client - Application now uses local NestJS API
// This file exists to prevent import errors during migration

const mockSupabaseClient = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signUp: async () => ({ data: null, error: new Error('Use API instead') }),
    signInWithPassword: async () => ({ data: null, error: new Error('Use API instead') }),
    signOut: async () => ({ error: null }),
  },
  from: (table: string) => ({
    select: () => ({
      eq: () => ({
        maybeSingle: async () => ({ data: null, error: null }),
        single: async () => ({ data: null, error: null }),
        order: () => ({ data: [], error: null }),
      }),
      order: () => ({ data: [], error: null }),
    }),
    insert: () => ({
      select: () => ({
        single: async () => ({ data: null, error: null }),
      }),
    }),
    update: () => ({
      eq: () => ({ data: null, error: null }),
    }),
    upsert: () => ({
      select: () => ({ data: null, error: null }),
    }),
    delete: () => ({
      eq: () => ({ data: null, error: null }),
    }),
  }),
  functions: {
    invoke: async () => ({ data: null, error: null }),
  },
};

export const supabase = mockSupabaseClient as any;
