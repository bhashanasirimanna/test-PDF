import { PrismaClient, AnnotationType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const DEMO_USERS = [
  { name: 'Alice Johnson', email: 'alice@prokoti.com' },
  { name: 'Bob Smith', email: 'bob@prokoti.com' },
  { name: 'Carol Williams', email: 'carol@prokoti.com' },
  { name: 'David Brown', email: 'david@prokoti.com' },
  { name: 'Eve Davis', email: 'eve@prokoti.com' },
  { name: 'Frank Miller', email: 'frank@prokoti.com' },
  { name: 'Grace Wilson', email: 'grace@prokoti.com' },
  { name: 'Henry Moore', email: 'henry@prokoti.com' },
];

async function uploadSeedPdf(filename: string): Promise<{ s3Key: string; s3Url: string }> {
  const filePath = path.join(__dirname, '../../..', 'seed-assets', filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`Seed file not found: ${filePath} — skipping S3 upload`);
    return { s3Key: `seed/${filename}`, s3Url: `http://localhost/${filename}` };
  }
  const body = fs.readFileSync(filePath);
  const key = `seed/${Date.now()}-${filename}`;
  await s3.send(new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
    Body: body,
    ContentType: 'application/pdf',
  }));
  return {
    s3Key: key,
    s3Url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
  };
}

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('password123', 10);

  const users = await Promise.all(
    DEMO_USERS.map((u) =>
      prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: {
          name: u.name,
          email: u.email,
          passwordHash,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`,
        },
      }),
    ),
  );

  console.log(`Created ${users.length} users`);

  const doc1 = await uploadSeedPdf('sample1.pdf');
  const doc2 = await uploadSeedPdf('sample2.pdf');

  const documents = await Promise.all([
    prisma.document.upsert({
      where: { s3Key: doc1.s3Key },
      update: {},
      create: {
        name: 'Product Requirements Document',
        s3Key: doc1.s3Key,
        s3Url: doc1.s3Url,
        mimeType: 'application/pdf',
        uploadedById: users[0].id,
      },
    }),
    prisma.document.upsert({
      where: { s3Key: doc2.s3Key },
      update: {},
      create: {
        name: 'Technical Architecture Overview',
        s3Key: doc2.s3Key,
        s3Url: doc2.s3Url,
        mimeType: 'application/pdf',
        uploadedById: users[1].id,
      },
    }),
  ]);

  console.log(`Created ${documents.length} documents`);

  // Sample annotations
  const note = await prisma.annotation.create({
    data: {
      documentId: documents[0].id,
      userId: users[0].id,
      type: AnnotationType.NOTE,
      pageNumber: 1,
      rects: [{ x: 100, y: 200, w: 300, h: 20 }],
      selectedText: 'This is an important section',
      color: '#FFD700',
      content: 'Review this before the meeting',
      isPrivate: true,
    },
  });

  const discussion = await prisma.annotation.create({
    data: {
      documentId: documents[0].id,
      userId: users[0].id,
      type: AnnotationType.DISCUSSION,
      pageNumber: 2,
      rects: [{ x: 50, y: 300, w: 400, h: 20 }],
      selectedText: 'Architecture decision point',
      color: '#4CAF50',
      content: 'Should we reconsider this approach?',
      isPrivate: false,
      members: {
        create: [
          { userId: users[1].id },
          { userId: users[2].id },
        ],
      },
    },
  });

  await prisma.discussionReply.create({
    data: {
      annotationId: discussion.id,
      userId: users[1].id,
      content: 'I think we should evaluate the alternatives first.',
    },
  });

  console.log('Created sample annotations');
  console.log('Seed complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
