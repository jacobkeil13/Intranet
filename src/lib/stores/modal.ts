import type { ModalComponent } from "@skeletonlabs/skeleton";
import IsQueueForm from "$lib/components/forms/IsQueueForm.svelte";

const priority = [
  { id: 1, name: "Low"},
  { id: 2, name: "Medium"},
  { id: 3, name: "High"}
]

export const forms: Record<string, ModalComponent> = {
	isQueueModal: {
		ref: IsQueueForm,
		props: { priority },
		slot: '<p>Skeleton</p>'
	}
};