import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Booking, BookingSubmission } from "../backend";
import { useActor } from "./useActor";

export function useGetBookings() {
  const { actor, isFetching } = useActor();
  return useQuery<Booking[]>({
    queryKey: ["bookings"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBookings();
    },
    enabled: !!actor && !isFetching,
  });
}

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
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
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
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}
