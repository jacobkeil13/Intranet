import type { ModalComponent } from "@skeletonlabs/skeleton";

// Create Imports
import IsQueue_Create from "$lib/components/forms/create/IsQueue_Create.svelte";
import DrQueue_Create from "$lib/components/forms/create/DrQueue_Create.svelte";
import PopulationSelection_Create from "$lib/components/forms/create/PopulationSelection_Create.svelte";
import Form_Create from "$lib/components/forms/create/Form_Create.svelte";
import StandardProcedure_Create	from "$lib/components/forms/create/StandardProcedure_Create.svelte";
import Letter_Create from "$lib/components/forms/create/Letter_Create.svelte";
import MasterCalendar_Create from "$lib/components/forms/create/MasterCalendar_Create.svelte";
import TrainingSchedule_Create from "$lib/components/forms/create/TrainingSchedule_Create.svelte";
import UserProfile_Create from "$lib/components/forms/create/UserProfile_Create.svelte";
import GeneralLibrary_Create from "$lib/components/forms/create/GeneralLibrary_Create.svelte";
import Appointment_Create from "$lib/components/forms/create/Appointment_Create.svelte";
import TrackSheet_Create from "$lib/components/forms/create/TrackSheet_Create.svelte";
import TrackCode_Create from "$lib/components/forms/create/TrackCode_Create.svelte";

// Update Imports
import IsQueue_Update from "$lib/components/forms/update/IsQueue_Update.svelte"
import DrQueue_Update from "$lib/components/forms/update/DrQueue_Update.svelte"
import PopulationSelection_Update from "$lib/components/forms/update/PopulationSelection_Update.svelte";
import Form_Update from "$lib/components/forms/update/Form_Update.svelte"
import StandardProcedure_Update from "$lib/components/forms/update/StandardProcedure_Update.svelte"
import Letter_Update from "$lib/components/forms/update/Letter_Update.svelte"
import MasterCalendar_Update from "$lib/components/forms/update/MasterCalendar_Update.svelte"
import TrainingSchedule_Update from "$lib/components/forms/update/TrainingSchedule_Update.svelte";
import UserProfile_Update from "$lib/components/forms/update/UserProfile_Update.svelte";
import GeneralLibrary_Update from "$lib/components/forms/update/GeneralLibrary_Update.svelte";
import Appointment_Update from "$lib/components/forms/update/Appointment_Update.svelte";
import Referral_Update from "$lib/components/forms/update/Referral_Update.svelte";
import TrackSheet_Update from "$lib/components/forms/update/TrackSheet_Update.svelte";
import TrackCode_Update from "$lib/components/forms/update/TrackCode_Update.svelte";

// View Imports
import TrackSheet_View from "$lib/components/forms/view/TrackSheet_View.svelte";

// Other Imports
import EmbedModal from "$lib/components/modals/EmbedModal.svelte";
import ConfirmDeleteModal from "$lib/components/modals/ConfirmDeleteModal.svelte";
import SearchUidModal from "$lib/components/modals/SearchUidModal.svelte";
import SearchPhoneCall from "$lib/components/modals/SearchPhoneCall.svelte";
import VisitStatsModal from "$lib/components/modals/VisitStatsModal.svelte";

export const forms: Record<string, ModalComponent> = {
	// Create
	drQueueModal: { ref: DrQueue_Create },
	formModal: { ref: Form_Create },
	isQueueModal: { ref: IsQueue_Create },
	letterModal: { ref: Letter_Create },
	masterCalendarModal: { ref: MasterCalendar_Create },
	popselModal: { ref: PopulationSelection_Create },
	standardProcedureModal: { ref: StandardProcedure_Create },
	trainingModal: { ref: TrainingSchedule_Create },
	userProfileModal: { ref: UserProfile_Create },
	libraryModal: { ref: GeneralLibrary_Create },
	appointmentModal: { ref: Appointment_Create },
	trackSheetModal: { ref: TrackSheet_Create },
	trackCodeModal: { ref: TrackCode_Create },

	// Update
	updateDrQueueModal: { ref: DrQueue_Update },
	updateFormModal: { ref: Form_Update },
	updateIsQueueModal: { ref: IsQueue_Update },
	updateLetterModal: { ref: Letter_Update },
	updateMasterCalendarModal: { ref: MasterCalendar_Update },
	updatePopselModal: { ref: PopulationSelection_Update },
	updateStandardProcedureModal: { ref: StandardProcedure_Update },
	updateTrainingModal: { ref: TrainingSchedule_Update },
	updateUserProfileModal: { ref: UserProfile_Update },
	updateLibraryModal: { ref: GeneralLibrary_Update },
	updateAppointmentModal: { ref: Appointment_Update },
	updateReferralModal: { ref: Referral_Update },
	updateTrackSheetModal: { ref: TrackSheet_Update },
	updateTrackCodeModal: { ref: TrackCode_Update },

	// View
	viewTrackSheetModal: { ref: TrackSheet_View },

	// Other
	embedModal: { ref: EmbedModal },
	confirmDeleteModal: { ref: ConfirmDeleteModal },
	searchUidModal: {ref: SearchUidModal },
	searchPhoneCall: { ref: SearchPhoneCall },
	visitStatsModal: { ref: VisitStatsModal }
};