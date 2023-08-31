import { db } from "$lib/server/database";
import { redirect } from "@sveltejs/kit";

export const load = async ({ locals }) => {
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
    return { letters }
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
      description
     } = Object.fromEntries(await request.formData()) as {
        letterCode: string
        letterType: string
        letterGroup: string
        tape: string
        ruamail: string
        owner: string
        description: string
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
          letterGroup: { connect: { name: letterGroup } },
          weeklyTapeLoad: tape === 'on',
          staffInRuamail: ruamail === 'on',
          owner: { connect: { id: owner } },
          description: description,
        }
      });

      return { success: true, message: "Letter created successfully!", data: newLetter }
    } catch (error) {
      console.log(error);
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
      description
     } = Object.fromEntries(await request.formData()) as {
        id: string
        letterType: string
        letterGroup: string
        tape: string
        ruamail: string
        owner: string
        description: string
    }

    try {
      const updatedLetter = await db.letter.update({
        where: {
          id
        },
        data: {
          letterType: { connect: { name: letterType } },
          letterGroup: { connect: { name: letterGroup } },
          weeklyTapeLoad: tape === 'on',
          staffInRuamail: ruamail === 'on',
          owner: { connect: { id: owner } },
          description: description,
        }
      });

      return { success: true, message: "Letter updated successfully!" }
    } catch (error) {
      // console.log(error);
      return { success: false, message: "Letter update failed." }
    }
  }
}