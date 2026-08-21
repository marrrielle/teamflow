import bcrypt from 'bcrypt';
import { db } from './client';
import { users, projects, tasks } from './schema';

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const [alice] = await db
    .insert(users)
    .values({ email: 'alice@teamflow.dev', passwordHash, name: 'Alice Chen' })
    .returning();
  const [bob] = await db
    .insert(users)
    .values({ email: 'bob@teamflow.dev', passwordHash, name: 'Bob Martinez' })
    .returning();
  if (!alice || !bob) throw new Error('Failed to seed users');

  const [website] = await db
    .insert(projects)
    .values({ name: 'Website Redesign', description: 'Refresh the marketing site', color: '#6366f1', ownerId: alice.id })
    .returning();
  const [mobile] = await db
    .insert(projects)
    .values({ name: 'Mobile App', description: 'iOS/Android client', color: '#10b981', ownerId: bob.id })
    .returning();
  if (!website || !mobile) throw new Error('Failed to seed projects');

  await db.insert(tasks).values([
    { projectId: website.id, title: 'Design landing page', status: 'in_progress', priority: 'high', assigneeId: alice.id, position: 1 },
    { projectId: website.id, title: 'Set up analytics', status: 'todo', priority: 'medium', assigneeId: bob.id, position: 2 },
    { projectId: mobile.id, title: 'Onboarding flow', status: 'todo', priority: 'urgent', assigneeId: bob.id, position: 1 },
    { projectId: mobile.id, title: 'Push notifications', status: 'done', priority: 'low', assigneeId: alice.id, position: 2 },
  ]);

  console.log('Seed complete: 2 users, 2 projects, 4 tasks');
  console.log('Login with alice@teamflow.dev / password123 or bob@teamflow.dev / password123');
  process.exit(0);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
