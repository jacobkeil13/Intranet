import { db, getUserProfileByNetId } from "$lib/server/database";
import { redirect } from "@sveltejs/kit";
import moment from "moment";

export const load = async ({ locals }) => {
  let profile = getUserProfileByNetId(locals.user.netid);
	if (locals.user) {
    let letters = await db.letter.findMany({
      orderBy: {
        letterCode: {
          name: "asc"
        }
      },
      include: {
        lastEditedBy: true,
        letterCode: true,
        letterGroup: true,
        letterType: true,
        owner: true
      }
    });
    return { letters, profile }
	} else {
		throw redirect(302, '/dashboard');
	}
}

export const actions = {
  create: async ({ request }) => {
    const {
      letterCode,
      letterType,
      letterGroup,
      tape, 
      ruamail, 
      owner,
      description,
      updatedAt
     } = Object.fromEntries(await request.formData()) as {
      letterCode: string
      letterType: string
      letterGroup: string
      tape: string
      ruamail: string
      owner: string
      description: string
      updatedAt: string
    }

    try {
      const newLetterCode = await db.letterCode.create({
        data: {
          name: letterCode
        }
      });

      const newLetter = await db.letter.create({
        data: {
          letterCode: { connect: { name: newLetterCode.name } },
          letterType: { connect: { name: letterType } },
          letterGroup: { connect: { name: letterGroup }},
          weeklyTapeLoad: tape === 'on',
          staffInRuamail: ruamail === 'on',
          owner: { connect: { id: owner } },
          description: description,
          createdAt: updatedAt !== "" ? moment(updatedAt).add(12, "hours").format() : undefined,
          updatedAt: updatedAt !== "" ? moment(updatedAt).add(12, "hours").format() : undefined
        }
      });

      return { success: true, message: "Letter created successfully!", data: newLetter }
    } catch (error) {
      console.log({ timestamp: moment().format(), source: "Letter_Create", error });
      return { success: false, message: "Letter creation failed." }
    }
  },
  update: async ({ request }) => {
    const {
      id,
      letterType,
      letterGroup,
      tape, 
      ruamail, 
      owner,
      description,
      updatedAt
     } = Object.fromEntries(await request.formData()) as {
        id: string
        letterType: string
        letterGroup: string
        tape: string
        ruamail: string
        owner: string
        description: string
        updatedAt: string
    }

    try {
      const updatedLetter = await db.letter.update({
        where: {
          id
        },
        data: {
          letterType: { connect: { name: letterType } },
          letterGroup: { connect: { name: letterGroup }},
          weeklyTapeLoad: tape === 'on',
          staffInRuamail: ruamail === 'on',
          owner: { connect: { id: owner } },
          description: description,
          updatedAt: updatedAt !== "" ? moment(updatedAt).add(12, "hours").format() : undefined
        }
      });

      return { success: true, message: "Letter updated successfully!" }
    } catch (error) {
      console.log({ timestamp: moment().format(), source: "Letter_Update", error });
      return { success: false, message: "Letter update failed." }
    }
  }
}