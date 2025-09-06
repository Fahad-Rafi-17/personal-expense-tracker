CREATE TABLE "transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"type" varchar(10) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"category" varchar(100) NOT NULL,
	"description" text DEFAULT '',
	"date" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
