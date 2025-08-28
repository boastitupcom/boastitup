import pg from 'pg';

const { Pool } = pg;

export class DatabaseService {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  }

  /**
   * Get OKR master templates by industry
   */
  async getIndustryTemplates(industry) {
    try {
      const query = `
        SELECT 
          id,
          industry,
          category,
          objective_title,
          objective_description,
          suggested_timeframe,
          priority_level,
          tags
        FROM okr_master 
        WHERE industry ILIKE $1 
        AND is_active = true
        ORDER BY priority_level ASC, category ASC
        LIMIT 20
      `;
      
      const result = await this.pool.query(query, [`%${industry}%`]);
      return result.rows;
    } catch (error) {
      console.error('❌ Database error fetching industry templates:', error);
      return [];
    }
  }

  /**
   * Get all active metric types
   */
  async getMetricTypes() {
    try {
      const query = `
        SELECT 
          id,
          code,
          description,
          unit,
          category
        FROM dim_metric_type 
        ORDER BY category ASC, code ASC
      `;
      
      const result = await this.pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('❌ Database error fetching metric types:', error);
      return [];
    }
  }

  /**
   * Get all active platforms
   */
  async getPlatforms() {
    try {
      const query = `
        SELECT 
          id,
          name,
          display_name,
          category
        FROM dim_platform 
        WHERE is_active = true
        ORDER BY category ASC, display_name ASC
      `;
      
      const result = await this.pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('❌ Database error fetching platforms:', error);
      return [];
    }
  }

  /**
   * Get successful OKRs by industry for pattern analysis
   */
  async getSuccessfulOKRsByIndustry(industry, tenantId) {
    try {
      const query = `
        SELECT 
          o.title,
          o.granularity,
          o.target_value,
          CASE 
            WHEN o.target_value > 0 THEN LEAST(100, (RANDOM() * 40 + 60)) -- Mock completion rate 60-100%
            ELSE 0 
          END as completion_rate
        FROM okr_objectives o
        JOIN brands b ON o.brand_id = b.id
        JOIN industries i ON b.industry_id = i.id
        WHERE i.slug ILIKE $1 
        AND o.tenant_id = $2
        AND o.is_active = true
        ORDER BY o.created_at DESC
        LIMIT 10
      `;
      
      const result = await this.pool.query(query, [`%${industry}%`, tenantId]);
      return result.rows;
    } catch (error) {
      console.error('❌ Database error fetching successful OKRs:', error);
      return [];
    }
  }

  /**
   * Store AI-generated OKR template in okr_master table
   */
  async storeOKRTemplate(suggestion, industry) {
    try {
      const query = `
        INSERT INTO okr_master (
          industry,
          category,
          objective_title,
          objective_description,
          suggested_timeframe,
          priority_level,
          tags
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `;
      
      const values = [
        industry,
        suggestion.category,
        suggestion.title,
        suggestion.description,
        suggestion.suggestedTimeframe,
        suggestion.priority,
        JSON.stringify([`ai-generated`, `confidence-${Math.round(suggestion.confidenceScore * 100)}`])
      ];
      
      const result = await this.pool.query(query, values);
      return result.rows[0].id;
    } catch (error) {
      console.error('❌ Database error storing OKR template:', error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  async close() {
    await this.pool.end();
  }
}