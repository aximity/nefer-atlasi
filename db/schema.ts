import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const contributions = sqliteTable(
  "contributions",
  {
    id: text("id").primaryKey(),
    receiptTokenHash: text("receipt_token_hash").notNull(),
    type: text("type").notNull(),
    subject: text("subject").notNull(),
    server: text("server").notNull(),
    observedAt: text("observed_at").notNull(),
    payloadJson: text("payload_json").notNull(),
    payloadHash: text("payload_hash").notNull(),
    clientTokenHash: text("client_token_hash").notNull(),
    sourceCount: integer("source_count").notNull().default(0),
    contributorAlias: text("contributor_alias"),
    contactPrivate: text("contact_private"),
    verificationStatus: text("verification_status").notNull().default("draft"),
    publicationStatus: text("publication_status").notNull().default("queued"),
    uploadStatus: text("upload_status").notNull().default("complete"),
    moderationNote: text("moderation_note"),
    reviewedAt: text("reviewed_at"),
    publishedAt: text("published_at"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("contributions_receipt_hash_unique").on(table.receiptTokenHash),
    index("contributions_client_created_idx").on(table.clientTokenHash, table.createdAt),
    index("contributions_payload_created_idx").on(table.payloadHash, table.createdAt),
    index("contributions_queue_idx").on(table.publicationStatus, table.createdAt),
  ],
);

export const contributionEvents = sqliteTable(
  "contribution_events",
  {
    id: text("id").primaryKey(),
    contributionId: text("contribution_id")
      .notNull()
      .references(() => contributions.id, { onDelete: "cascade" }),
    action: text("action").notNull(),
    actorLabel: text("actor_label").notNull(),
    actorEmailHash: text("actor_email_hash").notNull(),
    fromVerification: text("from_verification"),
    toVerification: text("to_verification"),
    fromPublication: text("from_publication"),
    toPublication: text("to_publication"),
    note: text("note"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("contribution_events_contribution_idx").on(
      table.contributionId,
      table.createdAt,
    ),
  ],
);

export const contributionFiles = sqliteTable(
  "contribution_files",
  {
    id: text("id").primaryKey(),
    contributionId: text("contribution_id")
      .notNull()
      .references(() => contributions.id, { onDelete: "cascade" }),
    r2Key: text("r2_key").notNull(),
    originalName: text("original_name").notNull(),
    mediaKind: text("media_kind").notNull(),
    mimeType: text("mime_type").notNull(),
    byteSize: integer("byte_size").notNull(),
    sha256: text("sha256").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("contribution_files_r2_key_unique").on(table.r2Key),
    index("contribution_files_contribution_idx").on(table.contributionId),
    index("contribution_files_sha256_idx").on(table.sha256),
  ],
);

export const canonicalRecords = sqliteTable(
  "canonical_records",
  {
    id: text("id").primaryKey(),
    entityType: text("entity_type").notNull(),
    entityKey: text("entity_key").notNull(),
    displayName: text("display_name").notNull(),
    dataJson: text("data_json").notNull(),
    version: integer("version").notNull().default(1),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    sourceContributionId: text("source_contribution_id").references(
      () => contributions.id,
      { onDelete: "set null" },
    ),
    updatedByHash: text("updated_by_hash").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("canonical_records_type_key_unique").on(
      table.entityType,
      table.entityKey,
    ),
    index("canonical_records_public_idx").on(table.active, table.entityType),
  ],
);

export const canonicalRevisions = sqliteTable(
  "canonical_revisions",
  {
    id: text("id").primaryKey(),
    recordId: text("record_id")
      .notNull()
      .references(() => canonicalRecords.id, { onDelete: "cascade" }),
    contributionId: text("contribution_id").references(() => contributions.id, {
      onDelete: "set null",
    }),
    action: text("action").notNull(),
    version: integer("version").notNull(),
    previousDataJson: text("previous_data_json"),
    nextDataJson: text("next_data_json"),
    previousActive: integer("previous_active", { mode: "boolean" }).notNull(),
    nextActive: integer("next_active", { mode: "boolean" }).notNull(),
    actorLabel: text("actor_label").notNull(),
    actorEmailHash: text("actor_email_hash").notNull(),
    note: text("note"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("canonical_revisions_record_idx").on(table.recordId, table.createdAt),
    index("canonical_revisions_contribution_idx").on(
      table.contributionId,
      table.createdAt,
    ),
  ],
);

export const farmRouteTemplates = sqliteTable(
  "farm_route_templates",
  {
    id: text("id").primaryKey(),
    ownerEmailHash: text("owner_email_hash").notNull(),
    server: text("server").notNull(),
    region: text("region").notNull(),
    routeName: text("route_name").notNull(),
    profession: text("profession").notNull(),
    defaultBooster: text("default_booster").notNull(),
    expectedMinutes: integer("expected_minutes").notNull(),
    notes: text("notes"),
    mapR2Key: text("map_r2_key"),
    mapMimeType: text("map_mime_type"),
    status: text("status").notNull().default("active"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("farm_route_templates_owner_region_idx").on(
      table.ownerEmailHash,
      table.region,
    ),
    index("farm_route_templates_owner_status_idx").on(
      table.ownerEmailHash,
      table.status,
    ),
  ],
);

export const farmRoutePoints = sqliteTable(
  "farm_route_points",
  {
    id: text("id").primaryKey(),
    templateId: text("template_id")
      .notNull()
      .references(() => farmRouteTemplates.id, { onDelete: "cascade" }),
    orderIndex: integer("order_index").notNull(),
    pointType: text("point_type").notNull(),
    label: text("label").notNull(),
    materialHint: text("material_hint"),
    xPermille: integer("x_permille").notNull(),
    yPermille: integer("y_permille").notNull(),
    notes: text("notes"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("farm_route_points_template_order_idx").on(
      table.templateId,
      table.orderIndex,
    ),
  ],
);

export const farmSessions = sqliteTable(
  "farm_sessions",
  {
    id: text("id").primaryKey(),
    ownerEmailHash: text("owner_email_hash").notNull(),
    server: text("server").notNull(),
    region: text("region").notNull(),
    routeName: text("route_name").notNull(),
    profession: text("profession").notNull(),
    observedAt: text("observed_at").notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    nodeCount: integer("node_count").notNull(),
    boosterProfile: text("booster_profile").notNull(),
    gameCost: integer("game_cost").notNull().default(0),
    tlCostKurus: integer("tl_cost_kurus").notNull().default(0),
    notes: text("notes"),
    routeTemplateId: text("route_template_id").references(
      () => farmRouteTemplates.id,
      { onDelete: "set null" },
    ),
    submittedContributionId: text("submitted_contribution_id").references(
      () => contributions.id,
      { onDelete: "set null" },
    ),
    status: text("status").notNull().default("active"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("farm_sessions_owner_date_idx").on(
      table.ownerEmailHash,
      table.observedAt,
    ),
    index("farm_sessions_owner_region_idx").on(
      table.ownerEmailHash,
      table.region,
    ),
  ],
);

export const farmYields = sqliteTable(
  "farm_yields",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id")
      .notNull()
      .references(() => farmSessions.id, { onDelete: "cascade" }),
    material: text("material").notNull(),
    grade: text("grade").notNull(),
    quantity: integer("quantity").notNull(),
    unitGamePrice: integer("unit_game_price"),
    unitTlKurus: integer("unit_tl_kurus"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("farm_yields_session_idx").on(table.sessionId),
    index("farm_yields_material_idx").on(table.material),
  ],
);

export const groupAnnouncements = sqliteTable(
  "group_announcements",
  {
    id: text("id").primaryKey(),
    receiptTokenHash: text("receipt_token_hash").notNull(),
    clientTokenHash: text("client_token_hash").notNull(),
    server: text("server").notNull(),
    category: text("category").notNull(),
    region: text("region").notNull(),
    title: text("title").notNull(),
    rolesJson: text("roles_json").notNull(),
    leaderAlias: text("leader_alias").notNull(),
    channel: text("channel").notNull(),
    startAt: text("start_at").notNull(),
    expiresAt: text("expires_at").notNull(),
    status: text("status").notNull().default("active"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("group_announcements_receipt_unique").on(table.receiptTokenHash),
    index("group_announcements_active_start_idx").on(table.status, table.startAt),
    index("group_announcements_client_created_idx").on(table.clientTokenHash, table.createdAt),
  ],
);

export const guildLogisticsBoards = sqliteTable(
  "guild_logistics_boards",
  {
    id: text("id").primaryKey(),
    publicCode: text("public_code").notNull(),
    managerTokenHash: text("manager_token_hash").notNull(),
    clientTokenHash: text("client_token_hash").notNull(),
    guildName: text("guild_name").notNull(),
    server: text("server").notNull(),
    weekStart: text("week_start").notNull(),
    note: text("note"),
    status: text("status").notNull().default("active"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("guild_logistics_boards_public_code_unique").on(table.publicCode),
    uniqueIndex("guild_logistics_boards_manager_hash_unique").on(table.managerTokenHash),
    index("guild_logistics_boards_client_created_idx").on(table.clientTokenHash, table.createdAt),
  ],
);

export const guildLogisticsGoals = sqliteTable(
  "guild_logistics_goals",
  {
    id: text("id").primaryKey(),
    boardId: text("board_id").notNull().references(() => guildLogisticsBoards.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    category: text("category").notNull(),
    targetAmount: integer("target_amount").notNull(),
    unit: text("unit").notNull(),
    assignedRole: text("assigned_role").notNull(),
    status: text("status").notNull().default("active"),
    orderIndex: integer("order_index").notNull().default(0),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("guild_logistics_goals_board_order_idx").on(table.boardId, table.orderIndex)],
);

export const guildLogisticsContributions = sqliteTable(
  "guild_logistics_contributions",
  {
    id: text("id").primaryKey(),
    boardId: text("board_id").notNull().references(() => guildLogisticsBoards.id, { onDelete: "cascade" }),
    goalId: text("goal_id").notNull().references(() => guildLogisticsGoals.id, { onDelete: "cascade" }),
    receiptTokenHash: text("receipt_token_hash").notNull(),
    clientTokenHash: text("client_token_hash").notNull(),
    contributorAlias: text("contributor_alias").notNull(),
    amount: integer("amount").notNull(),
    note: text("note"),
    status: text("status").notNull().default("active"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("guild_logistics_contributions_receipt_unique").on(table.receiptTokenHash),
    index("guild_logistics_contributions_goal_idx").on(table.goalId, table.status),
    index("guild_logistics_contributions_client_created_idx").on(table.clientTokenHash, table.createdAt),
  ],
);

export const guildLogisticsExpenses = sqliteTable(
  "guild_logistics_expenses",
  {
    id: text("id").primaryKey(),
    boardId: text("board_id").notNull().references(() => guildLogisticsBoards.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    category: text("category").notNull(),
    gameAmount: integer("game_amount").notNull(),
    note: text("note"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("guild_logistics_expenses_board_idx").on(table.boardId, table.createdAt)],
);

export const guildLogisticsBoosters = sqliteTable(
  "guild_logistics_boosters",
  {
    id: text("id").primaryKey(),
    boardId: text("board_id").notNull().references(() => guildLogisticsBoards.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    scope: text("scope").notNull(),
    quantity: integer("quantity").notNull(),
    status: text("status").notNull().default("Planlandı"),
    sponsorAlias: text("sponsor_alias"),
    note: text("note"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("guild_logistics_boosters_board_status_idx").on(table.boardId, table.status)],
);

export const analyticsDailyPages = sqliteTable(
  "analytics_daily_pages",
  {
    id: text("id").primaryKey(),
    day: text("day").notNull(),
    path: text("path").notNull(),
    views: integer("views").notNull().default(0),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("analytics_daily_pages_day_path_unique").on(table.day, table.path),
    index("analytics_daily_pages_day_idx").on(table.day),
  ],
);

export const analyticsDailySources = sqliteTable(
  "analytics_daily_sources",
  {
    id: text("id").primaryKey(),
    day: text("day").notNull(),
    source: text("source").notNull(),
    views: integer("views").notNull().default(0),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("analytics_daily_sources_day_source_unique").on(table.day, table.source),
    index("analytics_daily_sources_day_idx").on(table.day),
  ],
);

export const analyticsDailyVisitors = sqliteTable(
  "analytics_daily_visitors",
  {
    id: text("id").primaryKey(),
    day: text("day").notNull(),
    visitorHash: text("visitor_hash").notNull(),
    device: text("device").notNull(),
    firstPath: text("first_path").notNull(),
    source: text("source").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("analytics_daily_visitors_day_hash_unique").on(table.day, table.visitorHash),
    index("analytics_daily_visitors_day_idx").on(table.day),
    index("analytics_daily_visitors_day_device_idx").on(table.day, table.device),
  ],
);

export const analyticsLoginAttempts = sqliteTable(
  "analytics_login_attempts",
  {
    id: text("id").primaryKey(),
    fingerprintHash: text("fingerprint_hash").notNull(),
    windowStart: integer("window_start").notNull(),
    failures: integer("failures").notNull().default(0),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("analytics_login_attempts_fingerprint_idx").on(table.fingerprintHash, table.windowStart)],
);
