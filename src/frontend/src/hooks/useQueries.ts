import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Booking, BookingSubmission } from "../backend";
import { useActor } from "./useActor";

export function useGetTechnicianBookings() {
  const { actor, isFetching } = useActor();
  return useQuery<Booking[]>({
    queryKey: ["technicianBookings"],
    queryFn: async () => {
      if (!actor) return [];
      const a = actor as any;
      return a.getTechnicianBookings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateBookingStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      bookingId,
      newStatus,
    }: {
      bookingId: string;
      newStatus: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      const a = actor as any;
      const result = await a.updateBookingStatus(bookingId, newStatus);
      if (result && "err" in result) throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["technicianBookings"] });
      queryClient.invalidateQueries({ queryKey: ["adminBookings"] });
    },
  });
}

export function useSubmitBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (submission: BookingSubmission) => {
      if (!actor) throw new Error("Not connected");
      await actor.submitBooking(submission);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["technicianBookings"] });
    },
  });
}

export function useGetAdminBookings(
  email: string | null,
  passwordHash: string | null,
) {
  const { actor, isFetching } = useActor();
  return useQuery<Booking[]>({
    queryKey: ["adminBookings", email],
    queryFn: async () => {
      if (!actor || !email || !passwordHash) return [];
      const a = actor as any;
      const result = await a.getBookingsAuthenticated(email, passwordHash);
      if ("ok" in result) return result.ok;
      throw new Error(result.err);
    },
    enabled: !!actor && !isFetching && !!email && !!passwordHash,
    refetchInterval: 10000,
  });
}
