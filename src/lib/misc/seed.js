import { PrismaClient } from "@prisma/client";
import * as data from "./data.js";

const prisma = new PrismaClient();

async function main() {
  for (let role of data.role) {
    await prisma.role.create({
      data: role
    })
  }

  for (let addressType of data.addressType) {
    await prisma.addressType.create({
      data: addressType
    })
  }

  for (let priority of data.priority) {
    await prisma.priority.create({
      data: priority
    })
  }

  for (let application of data.application) {
    await prisma.application.create({
      data: application
    })
  }

  for (let aidYear of data.aidYear) {
    await prisma.aidYear.create({
      data: aidYear
    })
  }

  for (let title of data.title) {
    await prisma.title.create({
      data: title
    })
  }

  for (let team of data.team) {
    await prisma.team.create({
      data: team
    })
  }

  for (let dataRequestType of data.dataRequestType) {
    await prisma.dataRequestType.create({
      data: dataRequestType
    })
  }

  for (let requestType of data.requestType) {
    await prisma.requestType.create({
      data: requestType
    })
  }

  for (let letterCode of data.letterCode) {
    await prisma.letterCode.create({
      data: letterCode
    })
  }
}

main().catch(e => {
  console.log(e);
  process.exit(1)
}).finally(() => {
  prisma.$disconnect();
})