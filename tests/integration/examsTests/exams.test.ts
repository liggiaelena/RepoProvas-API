import supertest from "supertest";
import app, { init } from '../../../src/app';
import { getConnection, getRepository } from "typeorm";
import { clearDatabase } from "../../utils/database";
import { createExam } from "../../factories/examFactory";
import Exam from "../../../src/entities/Exam";
import faker from 'faker';


describe('GET /exams/:id', () => {
  beforeAll(async () => {
        await init();
  })
  afterAll(async () => {
    await clearDatabase();
    await getConnection().close();
  })

  it('Should return 400 when id is not valid', async () => {
    const id = "string";
    const result = await supertest(app)
    .get(`/exams/${id}`);
    expect(result.status).toEqual(400);
  })

  it('Should return 404 when id no exists', async () => {
    const id = faker.datatype.number();
    const result = await supertest(app)
    .get(`/exams/${id}`);
    expect(result.status).toEqual(404);
  })

  it('Should return exam when id is valid', async () => {
    const name = faker.name.findName();
    const link = faker.internet.url();
    await createExam(name, link);

    const exam = await getRepository(Exam).find({
      where: {name},
      relations: ['teacher','subject', 'category']
    })
    const result = await supertest(app)
    .get(`/exams/${exam[0].id}`);
    expect(result.status).toEqual(200);
    expect(result.body).toMatchObject(exam[0])
  })
})
