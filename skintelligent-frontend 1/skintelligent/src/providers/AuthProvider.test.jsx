import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import { AuthProvider } from "./AuthProvider";

vi.mock("../api/hooks", async () => {
  const actual = await vi.importActual("../api/hooks");
  return {
    ...actual,
    useSessionQuery: vi.fn(),
  };
});

const hooks = await import("../api/hooks");

describe("AuthProvider", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("clears auth-scoped cached data when there is no active session", async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(hooks.queryKeys.session, {
      user_id: 101,
      name: "Maya",
    });
    queryClient.setQueryData(hooks.queryKeys.me, {
      user_id: 101,
      name: "Maya",
    });
    queryClient.setQueryData(hooks.queryKeys.profile, {
      skin_type: "oily",
    });
    queryClient.setQueryData(hooks.queryKeys.savedProducts, [{ product_id: 501 }]);
    queryClient.setQueryData(hooks.queryKeys.recommendations({ limit: 6 }), {
      recommendations: [{ product_id: 501 }],
    });
    queryClient.setQueryData(hooks.queryKeys.personalizedProducts({ limit: 12 }), [
      { product_id: 501 },
    ]);
    queryClient.setQueryData(hooks.queryKeys.productAnalysis(501), {
      product: { product_id: 501 },
    });

    hooks.useSessionQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <div>Auth shell</div>
        </AuthProvider>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(queryClient.getQueryData(hooks.queryKeys.session)).toBeNull();
      expect(queryClient.getQueryData(hooks.queryKeys.me)).toBeNull();
      expect(queryClient.getQueryData(hooks.queryKeys.profile)).toBeUndefined();
      expect(queryClient.getQueryData(hooks.queryKeys.savedProducts)).toBeUndefined();
      expect(queryClient.getQueryData(hooks.queryKeys.recommendations({ limit: 6 }))).toBeUndefined();
      expect(queryClient.getQueryData(hooks.queryKeys.personalizedProducts({ limit: 12 }))).toBeUndefined();
      expect(queryClient.getQueryData(hooks.queryKeys.productAnalysis(501))).toBeUndefined();
    });
  });
});
