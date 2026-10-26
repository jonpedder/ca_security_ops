# Existing Workflow Job Migration

The audited application uses Workflow Manager item `107ce7ab64494cdf837490fd0c7b3cbf` and template `Watch Center Incident Audited`. Existing jobs in the previous item cannot be moved in place because Workflow Manager jobs remain bound to their source workflow item, template, diagram version, and extended-property schema.

## Migration procedure

1. Freeze writes to the previous application while taking the migration snapshot.
2. Export every existing `ALERT_*` job with `extProps=true`, comments, history, attachments, location, assignment, priority, status, dates, and current step.
3. Create one job in the audited template for each source job. Preserve the `ALERT_<alertId>` job name so application lookup continues to work.
4. Populate `incident_audit` incident fields from the latest `INCIDENT_JSON` comment and source job fields.
5. Copy structured `AUDIT_JSON` comments in chronological order. Keep the original actor and timestamp inside each copied JSON payload because the copy operation itself is attributed to the migration account.
6. Copy ordinary comments and attachments. Add a migration comment containing the source workflow item ID and source job ID.
7. Set priority, status, assignment, description, due date, and location on the destination job. Record the source current step in the migration comment; do not claim that execution history or the exact diagram position was preserved.
8. Store the latest structured event in the `incident_audit` fields (`event_type`, `field_name`, values, note, actor, timestamp).
9. Verify counts and per-job checksums for comments and attachments, then switch the application to the audited item.
10. Make the previous job template inactive and retain the old workflow item read-only for historical evidence. Do not delete it until retention requirements permit.

## Important limitations

- Workflow Manager does not provide an in-place transfer of jobs between workflow items.
- Native job-history timestamps and actors cannot be recreated exactly in the destination item.
- Existing jobs should therefore remain in the old item as the authoritative pre-cutover record; migrated jobs are operational continuations with explicit provenance.
- Run migration idempotently using source workflow item ID plus source job ID as the migration key, and verify no destination job already carries that key before creating another.
