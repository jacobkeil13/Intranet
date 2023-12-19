import type { ModalComponent } from '@skeletonlabs/skeleton';

// Create Imports
import { 
	IsQueue_Create, DrQueue_Create, PopulationSelection_Create, Form_Create,
	StandardProcedure_Create, Letter_Create, MasterCalendar_Create, TrainingSchedule_Create,
	UserProfile_Create, GeneralLibrary_Create, Appointment_Create, TrackSheet_Create,
	TrackCode_Create 
} from '$lib/components';

// Update Imports
import { 
	IsQueue_Update, DrQueue_Update, PopulationSelection_Update, Form_Update,
	StandardProcedure_Update, Letter_Update, MasterCalendar_Update, TrainingSchedule_Update,
	UserProfile_Update, GeneralLibrary_Update, Appointment_Update, TrackSheet_Update,
	TrackCode_Update , Referral_Update
} from '$lib/components';

// View Imports
import { TrackSheet_View } from '$lib/components';

// Other Imports
import { 
	EmbedModal, ConfirmDeleteModal, SearchUidModal, SearchPhoneCall, VisitStatsModal, 
	Versions 
} from '$lib/components';

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
	searchUidModal: { ref: SearchUidModal },
	searchPhoneCall: { ref: SearchPhoneCall },
	visitStatsModal: { ref: VisitStatsModal },
	versionModal: { ref: Versions }
};
