import { IPagination } from '@App/shared/interfaces/pagination.interface';

export interface IMovie {
  backdrop_path: string;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateMovieResponse {
  id: number;
  attributes: IMovie;
}

export interface IFindAllMovies {
  results: IMovie[];
  page: number;
  total_pages: number;
  total_results: number;
}

export interface IFindAllMoviesResponse {
  data: ICreateMovieResponse[];
  pagination: IPagination;
}
