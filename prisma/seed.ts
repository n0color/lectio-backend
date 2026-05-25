import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import { PrismaClient } from "../generated/prisma/client";
import { Role } from "../generated/prisma/enums";

const COVER_URL = "/static/covers/273a6ef0-4a14-4c9f-95c0-1e1541f93523.jpg";
const SEED_PASSWORD = "SeedPassword123!";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

type AuthorSeed = {
  login: string;
  nickname: string;
  email: string;
};

type BookSeed = {
  title: string;
  description: string;
  authorLogin: string;
  genreName: string;
  tagNames: string[];
  chapterTitle: string;
  chapterContent: string;
};

const AUTHORS: AuthorSeed[] = [
  { login: "tolstoy", nickname: "Лев Толстой", email: "tolstoy@seed.lectio.local" },
  { login: "dostoevsky", nickname: "Фёдор Достоевский", email: "dostoevsky@seed.lectio.local" },
  { login: "bulgakov", nickname: "Михаил Булгаков", email: "bulgakov@seed.lectio.local" },
  { login: "turgenev", nickname: "Иван Тургенев", email: "turgenev@seed.lectio.local" },
  { login: "pushkin", nickname: "Александр Пушкин", email: "pushkin@seed.lectio.local" },
  { login: "lermontov", nickname: "Михаил Лермонтов", email: "lermontov@seed.lectio.local" },
  { login: "goncharov", nickname: "Иван Гончаров", email: "goncharov@seed.lectio.local" },
  { login: "gogol", nickname: "Николай Гоголь", email: "gogol@seed.lectio.local" },
  { login: "chekhov", nickname: "Антон Чехов", email: "chekhov@seed.lectio.local" },
  { login: "saltikov", nickname: "Иван Салтыков-Щедрин", email: "saltikov@seed.lectio.local" },
  { login: "gertsen", nickname: "Александр Герцен", email: "gertsen@seed.lectio.local" },
  { login: "mayakovsky", nickname: "Владимир Маяковский", email: "mayakovsky@seed.lectio.local" },
  { login: "pasternak", nickname: "Борис Пастернак", email: "pasternak@seed.lectio.local" },
  { login: "sholokhov", nickname: "Михаил Шолохов", email: "sholokhov@seed.lectio.local" },
  { login: "zamyatin", nickname: "Евгений Замятин", email: "zamyatin@seed.lectio.local" },
  { login: "bely", nickname: "Андрей Белый", email: "bely@seed.lectio.local" },
];

const GENRES = [
  { name: "Классическая проза", description: "Русская и мировая классическая художественная проза" },
  { name: "Поэзия", description: "Поэмы, стихотворения и поэтические циклы" },
  { name: "Драма", description: "Пьесы и драматические произведения" },
  { name: "Сатира", description: "Сатирические романы и повести" },
];

const TAGS = ["классика", "XIX век", "XX век", "роман", "поэма", "драма", "философия", "история"];

const BOOKS: BookSeed[] = [
  {
    title: "Война и мир",
    description: "Эпический роман о русском обществе в эпоху наполеоновских войн.",
    authorLogin: "tolstoy",
    genreName: "Классическая проза",
    tagNames: ["классика", "XIX век", "роман", "история"],
    chapterTitle: "Часть первая. I",
    chapterContent:
      "— Eh bien, mon prince. Gênes et Lucques ne sont plus que des apanages, des поместья de la famille Buonaparte...",
  },
  {
    title: "Анна Каренина",
    description: "Роман о любви, долге и моральном выборе в дворянской среде.",
    authorLogin: "tolstoy",
    genreName: "Классическая проза",
    tagNames: ["классика", "XIX век", "роман"],
    chapterTitle: "Часть первая. I",
    chapterContent:
      "Все счастливые семьи похожи друг на друга, каждая несчастливая семья несчастлива по-своему.",
  },
  {
    title: "Преступление и наказание",
    description: "Психологический роман о студенте Родионе Раскольникове.",
    authorLogin: "dostoevsky",
    genreName: "Классическая проза",
    tagNames: ["классика", "XIX век", "роман", "философия"],
    chapterTitle: "Часть I. I",
    chapterContent:
      "В начале июля, в чрезвычайно жаркое время, под вечер, один молодой человек вышел из своей каморки...",
  },
  {
    title: "Идиот",
    description: "Роман о князе Мышкине — «положительно прекрасном человеке».",
    authorLogin: "dostoevsky",
    genreName: "Классическая проза",
    tagNames: ["классика", "XIX век", "роман"],
    chapterTitle: "Часть первая. I",
    chapterContent:
      "В конце ноября, в оттепель, часов в девять утра, поезд Петербургско-Варшавской железной дороги...",
  },
  {
    title: "Братья Карамазовы",
    description: "Философский роман о семье Карамазовых и духовном поиске.",
    authorLogin: "dostoevsky",
    genreName: "Классическая проза",
    tagNames: ["классика", "XIX век", "роман", "философия"],
    chapterTitle: "Книга первая. История одной семейки. I",
    chapterContent:
      "Алексей Фёдорович Карамазов был третьим сыном помещика нашего уезда Фёдора Павловича Карамазова...",
  },
  {
    title: "Мастер и Маргарита",
    description: "Мистический роман о добре и зле, любви и творчестве.",
    authorLogin: "bulgakov",
    genreName: "Классическая проза",
    tagNames: ["классика", "XX век", "роман", "философия"],
    chapterTitle: "Глава 1. Никогда не разговаривайте с неизвестными",
    chapterContent:
      "В час жаркого весеннего заката на Патриарших прудах появились два гражданина.",
  },
  {
    title: "Отцы и дети",
    description: "Роман о конфликте поколений и нигилизме.",
    authorLogin: "turgenev",
    genreName: "Классическая проза",
    tagNames: ["классика", "XIX век", "роман"],
    chapterTitle: "I",
    chapterContent: "«Что ты делаешь? Пьёшь?» — «Пью, батюшка, пью!»",
  },
  {
    title: "Евгений Онегин",
    description: "Роман в стихах о жизни русского дворянства.",
    authorLogin: "pushkin",
    genreName: "Поэзия",
    tagNames: ["классика", "XIX век", "поэма"],
    chapterTitle: "Глава I",
    chapterContent: "«Мой дядя самых честных правил, когда не в шутку занемог...»",
  },
  {
    title: "Герой нашего времени",
    description: "Психологический роман о Печорине и его окружении.",
    authorLogin: "lermontov",
    genreName: "Классическая проза",
    tagNames: ["классика", "XIX век", "роман"],
    chapterTitle: "Бэла",
    chapterContent: "Я ехал на перекладных из Тифлиса.",
  },
  {
    title: "Обломов",
    description: "Роман о русском «обломовщине» и нравственном пробуждении.",
    authorLogin: "goncharov",
    genreName: "Классическая проза",
    tagNames: ["классика", "XIX век", "роман"],
    chapterTitle: "Часть первая. I",
    chapterContent:
      "Илья Ильич Обломов провёл всё утро в своей комнате, принимая ванну, и долго не мог одеться.",
  },
  {
    title: "Мёртвые души",
    description: "Поэма о Чичикове и «мертвых душах» помещичьей России.",
    authorLogin: "gogol",
    genreName: "Сатира",
    tagNames: ["классика", "XIX век", "роман"],
    chapterTitle: "Глава I",
    chapterContent:
      "В губернском городе N выехал на базар какой-то чрезвычайно приятный наружностью господин...",
  },
  {
    title: "Ревизор",
    description: "Комедия о провинциальном городе, ожидающем ревизора.",
    authorLogin: "gogol",
    genreName: "Драма",
    tagNames: ["классика", "XIX век", "драма"],
    chapterTitle: "Действие I",
    chapterContent: "Городничий. Я пригласил вас, господа, на то, чтобы известить вас о неприятном известии.",
  },
  {
    title: "Вишнёвый сад",
    description: "Пьеса о гибели дворянского поместья Раневскихую.",
    authorLogin: "chekhov",
    genreName: "Драма",
    tagNames: ["классика", "XX век", "драма"],
    chapterTitle: "Действие I",
    chapterContent: "Лопахин. Приехала, барыня приехала!",
  },
  {
    title: "Господа Головлёвы",
    description: "Сатирический роман о вырождении дворянской семьи.",
    authorLogin: "saltikov",
    genreName: "Сатира",
    tagNames: ["классика", "XIX век", "роман"],
    chapterTitle: "Глава I",
    chapterContent: "В одном из глухих углов Орловской губернии стояло имение Головлёвых.",
  },
  {
    title: "Кто виноват?",
    description: "Повесть о любви, свободе и ответственности.",
    authorLogin: "gertsen",
    genreName: "Классическая проза",
    tagNames: ["классика", "XIX век", "роман", "философия"],
    chapterTitle: "Глава I",
    chapterContent: "Бельковский — маленький городок на берегу Волги.",
  },
  {
    title: "Облако в штанах",
    description: "Поэма о революции, любви и поэтическом долге.",
    authorLogin: "mayakovsky",
    genreName: "Поэзия",
    tagNames: ["классика", "XX век", "поэма"],
    chapterTitle: "Пролог",
    chapterContent: "Вы думаете, это бред? Сумасшествие? Галлюцинация?",
  },
  {
    title: "Доктор Живаго",
    description: "Роман о судьбе интеллигенции в годы революции и гражданской войны.",
    authorLogin: "pasternak",
    genreName: "Классическая проза",
    tagNames: ["классика", "XX век", "роман", "история"],
    chapterTitle: "Часть первая. I",
    chapterContent: "В то время, когда началась революция, Юрий Живаго был десяти лет.",
  },
  {
    title: "Тихий Дон",
    description: "Эпопея о донском казачестве в годы Первой мировой и гражданской войны.",
    authorLogin: "sholokhov",
    genreName: "Классическая проза",
    tagNames: ["классика", "XX век", "роман", "история"],
    chapterTitle: "Часть первая. I",
    chapterContent: "Мелькали мимо окон вагона станции, полевые станы, колодцы.",
  },
  {
    title: "Мы",
    description: "Антиутопический роман о тоталитарном обществе Единого Государства.",
    authorLogin: "zamyatin",
    genreName: "Классическая проза",
    tagNames: ["классика", "XX век", "роман", "философия"],
    chapterTitle: "Запись 1",
    chapterContent: "Это — моя запись. Всё, что я увижу, что подумаю, что пойму, — запишу.",
  },
  {
    title: "Петербург",
    description: "Символистический роман о террористе Дудкине и его отце-сенаторе.",
    authorLogin: "bely",
    genreName: "Классическая проза",
    tagNames: ["классика", "XX век", "роман"],
    chapterTitle: "Глава первая",
    chapterContent: "Апокалипсис нашего времени — Петербург.",
  },
];

async function clearDatabase() {
  await prisma.reviewComment.deleteMany();
  await prisma.review.deleteMany();
  await prisma.userBook.deleteMany();
  await prisma.bookTag.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.book.deleteMany();
  await prisma.friendship.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.token.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  console.log("Очистка базы данных...");
  await clearDatabase();

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 4);

  console.log("Создание жанров...");
  const genreMap = new Map<string, string>();
  for (const genre of GENRES) {
    const created = await prisma.genre.create({ data: genre });
    genreMap.set(created.name, created.id);
  }

  console.log("Создание авторов...");
  const authorMap = new Map<string, string>();
  for (const author of AUTHORS) {
    const user = await prisma.user.create({
      data: {
        login: author.login,
        nickname: author.nickname,
        email: author.email,
        password: passwordHash,
        role: Role.USER,
        isActivated: true,
      },
    });
    authorMap.set(author.login, user.id);
  }

  console.log("Создание тегов...");
  const tagMap = new Map<string, string>();
  const firstAuthorId = authorMap.get(AUTHORS[0]!.login)!;
  for (const tagName of TAGS) {
    const tag = await prisma.tag.create({
      data: {
        name: tagName,
        creatorId: firstAuthorId,
      },
    });
    tagMap.set(tag.name, tag.id);
  }

  console.log("Создание книг...");
  for (const book of BOOKS) {
    const authorId = authorMap.get(book.authorLogin);
    if (!authorId) {
      throw new Error(`Автор не найден: ${book.authorLogin}`);
    }

    const genreId = genreMap.get(book.genreName);
    if (!genreId) {
      throw new Error(`Жанр не найден: ${book.genreName}`);
    }

    const createdBook = await prisma.book.create({
      data: {
        title: book.title,
        description: book.description,
        coverUrl: COVER_URL,
        authorId,
        genreId,
        isAuthorReg: true,
        isApproved: true,
        views: Math.floor(Math.random() * 5000) + 100,
        likes: Math.floor(Math.random() * 500) + 10,
        chapters: {
          create: {
            chapterNumber: 1,
            title: book.chapterTitle,
            content: book.chapterContent,
          },
        },
        tags: {
          create: book.tagNames.map((tagName) => ({
            tagId: tagMap.get(tagName)!,
          })),
        },
      },
    });

    console.log(`  ✓ ${createdBook.title}`);
  }

  console.log("\nГотово!");
  console.log(`  Авторов: ${AUTHORS.length}`);
  console.log(`  Книг: ${BOOKS.length}`);
  console.log(`  Жанров: ${GENRES.length}`);
  console.log(`  Тегов: ${TAGS.length}`);
  console.log(`  Обложка: ${COVER_URL}`);
}

main()
  .catch((error) => {
    console.error("Ошибка сидирования:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
