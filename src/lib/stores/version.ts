import type { Version } from "$lib/types";

export const currentVersion: string = "1.0.1"
export const versions: Version[] = [
  {
    version: "1.0.1",
    date: "2023-10-24",
    notes: [
      {
        header: "Versioning",
        items: [
          "Every new update we push to the main site here will make this box open back up. The dismiss button will close this until a new version is pushed to the site. The top right of the box this is in will have all past versions and soon will have upcoming changes that will me made on the next update."
        ]
      },
      {
        header: "Authentication",
        items: [
          "As some of you may know, there is an occasional error that happens when you come to the intranet that says <span class='font-semibold underline'>csrf token does not match</span>. We are 99% sure that this has to do with people accessing <span class='font-semibold underline'>BANNER</span> or <span class='font-semibold underline'>MyUSF</span> before accessing the intranet after we update the server. To mitigate these errors for the time being, make sure to open the intranet before you do anything with <span class='font-semibold underline'>BANNER</span>, etc. If you are doing this and it still doesn't work, please let the IS team know!"
        ]
      },
      {
        header: "Counter Duty",
        items: [
          "Fixed occasional occurrences when student U#'s would not come up with any data. This was because those students <span class='font-semibold underline'>had no campus set</span> since they hadn't started their term yet. This should be fixed now. Let us know of any other outliar U#'s that don't come up with any data. <span class='font-semibold underline'>(Thanks to Mike for figuring this out)</span>"
        ]
      },
      {
        header: "Queues",
        items: [
          "Added the Date Requested column to the IS Queue table. This can be sorted on like the other headers.",
          "Added <span class='font-semibold underline'>No comments</span> box in all the queue update modals to specify there are none."
        ]
      },
      {
        header: "Master Calendar",
        items: [
          "Items with type <span class='font-semibold underline'>ANN</span> no longer show up as overdue."
        ]
      },
      {
        header: "Forms / Letters / S&P's",
        items: [
          "Changed the filter for <span class='font-semibold underline'>up to date</span> / <span class='font-semibold underline'>out to date</span> to <span class='font-semibold underline'>all</span> / <span class='font-semibold underline'>out to date</span>. This will include everything so you can see both instead of having to switch tabs.",
          "Changed the BUDADJ form so you can pick more than <span class='font-semibold underline'>one</span> adjustment."
        ]
      },
    ]
  },
  {
    version: "1.0.0",
    date: "2023-10-23",
    notes: [
      {
        header: "General",
        items: [
          "The IS Queue and DR Queue now have columns that can be sorted by clicking the column header! Not all headers have a sort feature, the ones that can will have an <span class='font-bold'>*</span> indicator. You can click the header twice to allow for <span class='underline font-semibold'>ascending</span> sort or <span class='underline font-semibold'>descending</span> sort. This is indicated by an up or down arrow next to the header text. I will be adding header sort to the other tables across the intranet soon enough.",
          "Fixed some of the quick action buttons that were not opening."
        ]
      },
      {
        header: "Queues",
        items: [
          "If you have not already seen it, you can now upload up to <span class='underline font-semibold'>3 documents</span> along with an IS Queue or DR Queue request. This is also present when updating the request. We are still figuring out some problems with size related to the files, so if you get an error it is probably that.",
          "Queues no longer require a comment when updating. Also, the priority will automatically be set to <span class='underline font-semibold'>low</span> unless specified by the user."
        ]
      },
      {
        header: "Referral Queue",
        items: [
          "Referrals can now have multiple collaborators. When you select Collaboration Referral, it will allow you to pick as many people as you wish!",
          "Updating a Self / Collaboration Referrals that you are not a part of will add you to the email list automatically.",
          "Fixed emails not assigning to the right owner on update.",
          "You can now transfer a referral from <span class='underline font-semibold'>Self &gt; Collaboration</span> when you add at least one person to the list. Vice versa, it will transfer to a <span class='underline font-semibold'>Collaboration &gt; Self</span> when you take all collaborators out of the list. <span class='font-semibold'>Will prompt you to acknowledge that this will happen.</span>",
          "Updated symbol for overdue rather than it being the word <span class='underline font-semibold'>'overdue'</span>.",
          "Self Referrals now have a gray circle as the indicator.",
          "The collaborator column is now hoverable to see multiple collaborators in a popup."
        ]
      },
      {
        header: "Bug Reports",
        items: [
          "If these new fixes or features are not working as intended or any other processes of that matter, please email the IS team. We will fix them as soon as possible!"
        ]
      }
    ]
  }
]