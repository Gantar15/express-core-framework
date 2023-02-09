export interface IConfigurationService {
	get<T extends string | number>(key: string): T;
}
