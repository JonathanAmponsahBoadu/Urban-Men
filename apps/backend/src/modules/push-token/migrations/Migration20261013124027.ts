import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261013124027 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "push_token" drop constraint if exists "push_token_token_unique";`);
    this.addSql(`create table if not exists "push_token" ("id" text not null, "token" text not null, "customer_id" text null, "user_id" text null, "platform" text not null default 'android', "news_opt_in" boolean not null default true, "order_opt_in" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "push_token_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_push_token_token_unique" ON "push_token" ("token") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_push_token_deleted_at" ON "push_token" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_push_token_customer_id" ON "push_token" ("customer_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_push_token_user_id" ON "push_token" ("user_id") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "push_token" cascade;`);
  }

}
