// lib/supabase.ts — lightweight fetch-based Supabase client (no SDK)
// Replaces @supabase/supabase-js to eliminate ~350KB per-bundle overhead
import { getEnv } from '@/lib/env'

type Json = Record<string, unknown>
type Row = Record<string, unknown>
type FilterEntry = [string, string] // [col, "op.value"]

// ─── Result helpers ────────────────────────────────────────────────────────────

function ok(data: unknown, count?: number) {
  return { data, error: null, count: count ?? null }
}
function err(e: unknown) {
  const message = e instanceof Error ? e.message : String(e)
  return { data: null, error: { message }, count: null }
}

// ─── Base builder ──────────────────────────────────────────────────────────────

class BaseBuilder {
  protected filters: FilterEntry[] = []
  protected _selectCols = '*'
  protected _single = false
  protected _count = false
  protected _head = false
  protected _orderCol?: string
  protected _orderAsc = true
  protected _returnData = false

  constructor(
    protected url: string,
    protected headers: Record<string, string>,
    protected table: string
  ) {}

  eq(col: string, val: unknown)  { this.filters.push([col, `eq.${val}`]); return this }
  gte(col: string, val: unknown) { this.filters.push([col, `gte.${val}`]); return this }

  order(col: string, opts?: { ascending?: boolean }) {
    this._orderCol = col
    this._orderAsc = opts?.ascending !== false
    return this
  }

  single() { this._single = true; return this }
  select(cols = '*', opts?: { count?: 'exact'; head?: boolean }) {
    this._selectCols = cols
    if (opts?.count === 'exact') this._count = true
    if (opts?.head) this._head = true
    this._returnData = true
    return this
  }

  protected queryUrl() {
    const u = new URL(`${this.url}/rest/v1/${this.table}`)
    u.searchParams.set('select', this._selectCols)
    for (const [col, val] of this.filters) u.searchParams.set(col, val)
    if (this._orderCol) u.searchParams.set('order', `${this._orderCol}.${this._orderAsc ? 'asc' : 'desc'}`)
    return u.toString()
  }

  protected reqHeaders(extra: Record<string, string> = {}) {
    const h = { ...this.headers, ...extra }
    if (this._single) h['Accept'] = 'application/vnd.pgrst.object+json'
    if (this._count) h['Prefer'] = 'count=exact'
    return h
  }
}

// ─── Select builder (thenable) ─────────────────────────────────────────────────

class SelectBuilder extends BaseBuilder {
  then(resolve: (v: ReturnType<typeof ok> | ReturnType<typeof err>) => void, reject?: (e: unknown) => void) {
    const run = async () => {
      try {
        const method = this._head ? 'HEAD' : 'GET'
        const res = await fetch(this.queryUrl(), { method, headers: this.reqHeaders() })
        if (this._head) {
          const cr = res.headers.get('content-range')
          const count = cr ? parseInt(cr.split('/')[1]) : 0
          return resolve(ok(null, count))
        }
        if (!res.ok) return resolve(err(await res.json().catch(() => ({ message: res.statusText }))))
        resolve(ok(await res.json()))
      } catch (e) { resolve(err(e)) }
    }
    run().catch(reject ?? (() => undefined))
  }
}

// ─── Insert builder (thenable) ────────────────────────────────────────────────

class InsertBuilder extends BaseBuilder {
  constructor(url: string, headers: Record<string, string>, table: string, private data: Json | Json[], private ignoreDups = false) {
    super(url, headers, table)
  }

  then(resolve: (v: ReturnType<typeof ok> | ReturnType<typeof err>) => void, reject?: (e: unknown) => void) {
    const run = async () => {
      try {
        const prefer = this._returnData
          ? (this.ignoreDups ? 'return=representation,resolution=ignore-duplicates' : 'return=representation')
          : (this.ignoreDups ? 'resolution=ignore-duplicates' : 'return=minimal')
        const h = this.reqHeaders({ 'Content-Type': 'application/json', 'Prefer': prefer })
        const res = await fetch(`${this.url}/rest/v1/${this.table}`, { method: 'POST', headers: h, body: JSON.stringify(this.data) })
        if (!res.ok) {
          const e = await res.json().catch(() => ({ message: res.statusText, code: String(res.status) }))
          return resolve(err(e))
        }
        const data = this._returnData ? await res.json().catch(() => null) : null
        resolve(ok(data))
      } catch (e) { resolve(err(e)) }
    }
    run().catch(reject ?? (() => undefined))
  }
}

// ─── Upsert builder (thenable) ────────────────────────────────────────────────

class UpsertBuilder extends BaseBuilder {
  constructor(url: string, headers: Record<string, string>, table: string, private data: Json | Json[], private onConflict?: string) {
    super(url, headers, table)
  }

  then(resolve: (v: ReturnType<typeof ok> | ReturnType<typeof err>) => void, reject?: (e: unknown) => void) {
    const run = async () => {
      try {
        const u = new URL(`${this.url}/rest/v1/${this.table}`)
        if (this.onConflict) u.searchParams.set('on_conflict', this.onConflict)
        const h = this.reqHeaders({ 'Content-Type': 'application/json', 'Prefer': 'return=representation,resolution=merge-duplicates' })
        const res = await fetch(u.toString(), { method: 'POST', headers: h, body: JSON.stringify(this.data) })
        if (!res.ok) return resolve(err(await res.json().catch(() => ({ message: res.statusText }))))
        resolve(ok(await res.json().catch(() => null)))
      } catch (e) { resolve(err(e)) }
    }
    run().catch(reject ?? (() => undefined))
  }
}

// ─── Update builder (thenable) ────────────────────────────────────────────────

class UpdateBuilder extends BaseBuilder {
  constructor(url: string, headers: Record<string, string>, table: string, private data: Json) {
    super(url, headers, table)
  }

  then(resolve: (v: ReturnType<typeof ok> | ReturnType<typeof err>) => void, reject?: (e: unknown) => void) {
    const run = async () => {
      try {
        const prefer = this._returnData ? 'return=representation' : 'return=minimal'
        const h = this.reqHeaders({ 'Content-Type': 'application/json', 'Prefer': prefer })
        const res = await fetch(this.queryUrl(), { method: 'PATCH', headers: h, body: JSON.stringify(this.data) })
        if (!res.ok) return resolve(err(await res.json().catch(() => ({ message: res.statusText }))))
        const data = this._returnData ? await res.json().catch(() => null) : null
        resolve(ok(data))
      } catch (e) { resolve(err(e)) }
    }
    run().catch(reject ?? (() => undefined))
  }
}

// ─── Delete builder (thenable) ────────────────────────────────────────────────

class DeleteBuilder extends BaseBuilder {
  then(resolve: (v: ReturnType<typeof ok> | ReturnType<typeof err>) => void, reject?: (e: unknown) => void) {
    const run = async () => {
      try {
        const res = await fetch(this.queryUrl(), { method: 'DELETE', headers: this.reqHeaders() })
        if (!res.ok) return resolve(err(await res.json().catch(() => ({ message: res.statusText }))))
        resolve(ok(null))
      } catch (e) { resolve(err(e)) }
    }
    run().catch(reject ?? (() => undefined))
  }
}

// ─── Table builder (entry point) ──────────────────────────────────────────────

class TableBuilder {
  constructor(private url: string, private headers: Record<string, string>, private table: string) {}

  private base() { return { url: this.url, headers: this.headers, table: this.table } as const }

  select(cols = '*', opts?: { count?: 'exact'; head?: boolean }) {
    const b = new SelectBuilder(this.url, this.headers, this.table)
    return b.select(cols, opts)
  }

  insert(data: Json | Json[], opts?: { ignoreDuplicates?: boolean }) {
    return new InsertBuilder(this.url, this.headers, this.table, data, opts?.ignoreDuplicates)
  }

  upsert(data: Json | Json[], opts?: { onConflict?: string }) {
    return new UpsertBuilder(this.url, this.headers, this.table, data, opts?.onConflict)
  }

  update(data: Json) {
    return new UpdateBuilder(this.url, this.headers, this.table, data)
  }

  delete() {
    return new DeleteBuilder(this.url, this.headers, this.table)
  }
}

// ─── Storage builder ──────────────────────────────────────────────────────────

class StorageBucketBuilder {
  constructor(private url: string, private headers: Record<string, string>, private bucket: string) {}

  async upload(path: string, data: ArrayBuffer | Blob, opts?: { contentType?: string }) {
    try {
      const h = { ...this.headers, 'Content-Type': opts?.contentType ?? 'application/octet-stream' }
      const res = await fetch(`${this.url}/storage/v1/object/${this.bucket}/${path}`, { method: 'POST', headers: h, body: data })
      if (!res.ok) return err(await res.json().catch(() => ({ message: res.statusText })))
      return ok(await res.json())
    } catch (e) { return err(e) }
  }

  async remove(paths: string[]) {
    try {
      const h = { ...this.headers, 'Content-Type': 'application/json' }
      const res = await fetch(`${this.url}/storage/v1/object/${this.bucket}`, { method: 'DELETE', headers: h, body: JSON.stringify({ prefixes: paths }) })
      if (!res.ok) return err(await res.json().catch(() => ({ message: res.statusText })))
      return ok(await res.json())
    } catch (e) { return err(e) }
  }

  getPublicUrl(path: string) {
    return { data: { publicUrl: `${this.url}/storage/v1/object/public/${this.bucket}/${path}` } }
  }
}

class StorageBuilder {
  constructor(private url: string, private headers: Record<string, string>) {}
  from(bucket: string) { return new StorageBucketBuilder(this.url, this.headers, bucket) }
}

// ─── Client ───────────────────────────────────────────────────────────────────

class SupabaseClient {
  readonly storage: StorageBuilder

  constructor(private url: string, private key: string) {
    const h = { apikey: key, Authorization: `Bearer ${key}` }
    this.storage = new StorageBuilder(url, h)
  }

  from(table: string) {
    const h = { apikey: this.key, Authorization: `Bearer ${this.key}` }
    return new TableBuilder(this.url, h, table)
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getSupabaseServer() {
  return new SupabaseClient(
    getEnv('NEXT_PUBLIC_SUPABASE_URL')!,
    getEnv('SUPABASE_SERVICE_ROLE_KEY')!
  )
}
