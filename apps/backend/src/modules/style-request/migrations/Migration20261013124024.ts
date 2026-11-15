import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261013124024 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "style_request" ("id" text not null, "customer_id" text null, "name" text not null, "contact" text not null, "description" text not null, "colour" text null, "budget" text null, "measurements" text null, "images" jsonb null, "status" text check ("status" in ('new', 'reviewing', 'quoted', 'accepted', 'declined')) not null default 'new', "quote_amount" integer null, "admin_note" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "style_request_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_style_request_deleted_at" ON "style_request" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "style_request_message" ("id" text not null, "from" text check ("from" in ('customer', 'admin')) not null, "text" text not null, "request_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "style_request_message_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_style_request_message_request_id" ON "style_request_message" ("request_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_style_request_message_deleted_at" ON "style_request_message" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "style_request_message" add constraint "style_request_message_request_id_foreign" foreign key ("request_id") references "style_request" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "style_request_message" drop constraint if exists "style_request_message_request_id_foreign";`);

    this.addSql(`drop table if exists "style_request" cascade;`);

    this.addSql(`drop table if exists "style_request_message" cascade;`);
  }

}
