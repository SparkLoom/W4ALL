import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapedJob {
  title: string;
  company?: string;
  location?: string;
  url: string;
  source: string;
  description?: string;
  salary?: string;
  postedDate?: string;
}

export class JobScraper {
  private static async fetchPage(url: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      return '';
    }
  }

  static async scrapeNetEmpregos(searchTerm: string): Promise<ScrapedJob[]> {
    const url = `https://www.net-empregos.com/pesquisa-empregos.asp?chave=${encodeURIComponent(searchTerm)}`;
    const html = await this.fetchPage(url);
    const $ = cheerio.load(html);
    const jobs: ScrapedJob[] = [];

    $('.job-item').each((_, element) => {
      const title = $(element).find('.job-title').text().trim();
      const company = $(element).find('.company-name').text().trim();
      const location = $(element).find('.job-location').text().trim();
      const url = $(element).find('a').attr('href') || '';

      jobs.push({
        title,
        company,
        location,
        url: url.startsWith('http') ? url : `https://www.net-empregos.com${url}`,
        source: 'Net Empregos'
      });
    });

    return jobs;
  }

  static async scrapeSapoEmpregos(searchTerm: string): Promise<ScrapedJob[]> {
    const url = `https://emprego.sapo.pt/empregos/${encodeURIComponent(searchTerm)}`;
    const html = await this.fetchPage(url);
    const $ = cheerio.load(html);
    const jobs: ScrapedJob[] = [];

    $('.job-listing').each((_, element) => {
      const title = $(element).find('.job-title').text().trim();
      const company = $(element).find('.company').text().trim();
      const location = $(element).find('.location').text().trim();
      const url = $(element).find('a').attr('href') || '';

      jobs.push({
        title,
        company,
        location,
        url: url.startsWith('http') ? url : `https://emprego.sapo.pt${url}`,
        source: 'SAPO Emprego'
      });
    });

    return jobs;
  }

  static async scrapeLinkedIn(searchTerm: string): Promise<ScrapedJob[]> {
    const url = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(searchTerm)}`;
    const html = await this.fetchPage(url);
    const $ = cheerio.load(html);
    const jobs: ScrapedJob[] = [];

    $('.job-card-container').each((_, element) => {
      const title = $(element).find('.job-card-list__title').text().trim();
      const company = $(element).find('.job-card-container__company-name').text().trim();
      const location = $(element).find('.job-card-container__metadata-item').first().text().trim();
      const url = $(element).find('a').attr('href') || '';

      jobs.push({
        title,
        company,
        location,
        url,
        source: 'LinkedIn'
      });
    });

    return jobs;
  }

  static async scrapeIndeed(searchTerm: string): Promise<ScrapedJob[]> {
    const url = `https://www.indeed.com/jobs?q=${encodeURIComponent(searchTerm)}`;
    const html = await this.fetchPage(url);
    const $ = cheerio.load(html);
    const jobs: ScrapedJob[] = [];

    $('.job_seen_beacon').each((_, element) => {
      const title = $(element).find('.jobTitle').text().trim();
      const company = $(element).find('.companyName').text().trim();
      const location = $(element).find('.companyLocation').text().trim();
      const url = $(element).find('a').attr('href') || '';

      jobs.push({
        title,
        company,
        location,
        url: url.startsWith('http') ? url : `https://www.indeed.com${url}`,
        source: 'Indeed'
      });
    });

    return jobs;
  }

  static async searchAllSites(searchTerm: string, onProgress: (progress: number) => void): Promise<ScrapedJob[]> {
    const scrapers = [
      this.scrapeNetEmpregos,
      this.scrapeSapoEmpregos,
      this.scrapeLinkedIn,
      this.scrapeIndeed
    ];

    const totalScrapers = scrapers.length;
    let completedScrapers = 0;
    const allJobs: ScrapedJob[] = [];

    await Promise.all(
      scrapers.map(async (scraper) => {
        try {
          const jobs = await scraper(searchTerm);
          allJobs.push(...jobs);
        } catch (error) {
          console.error(`Error with scraper:`, error);
        } finally {
          completedScrapers++;
          onProgress((completedScrapers / totalScrapers) * 100);
        }
      })
    );

    return allJobs;
  }
}