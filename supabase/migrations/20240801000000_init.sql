-- =============================================================================
-- FreelanceTracker :: Initial Schema Migration
-- Version: 20240801000000
-- Description: Creates invoices table with RLS policies referencing auth.uid()
-- =============================================================================

-- ── Extensions ────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Enum: Invoice Status ──────────────────────────────────────────────────────
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');

-- ── Table: invoices ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.invoices (
  id           UUID           PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID           NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name  TEXT           NOT NULL CHECK (char_length(client_name) BETWEEN 1 AND 255),
  amount       NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  due_date     DATE           NOT NULL,
  status       invoice_status NOT NULL DEFAULT 'draft',
  created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX idx_invoices_user_id    ON public.invoices (user_id);
CREATE INDEX idx_invoices_status     ON public.invoices (status);
CREATE INDEX idx_invoices_due_date   ON public.invoices (due_date);
CREATE INDEX idx_invoices_created_at ON public.invoices (created_at DESC);

-- ── Auto-update updated_at ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Policy: Users can SELECT only their own invoices
CREATE POLICY "invoices_select_own"
  ON public.invoices
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can INSERT invoices only for themselves
CREATE POLICY "invoices_insert_own"
  ON public.invoices
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can UPDATE only their own invoices
CREATE POLICY "invoices_update_own"
  ON public.invoices
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can DELETE only their own invoices
CREATE POLICY "invoices_delete_own"
  ON public.invoices
  FOR DELETE
  USING (auth.uid() = user_id);

-- ── Grant permissions to authenticated role only ──────────────────────────────
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
REVOKE ALL ON public.invoices FROM anon;
