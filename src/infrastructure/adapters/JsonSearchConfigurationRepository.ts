import {ISearchConfigurationRepository} from '../../domain/ports/ISearchConfigurationRepository';
import {SearchConfiguration} from '../../domain/entities/SearchConfiguration';
import {readFile} from 'fs/promises';
import {SearchConfigFileSchema} from '../validation/searchConfigSchema';
import {ZodError} from 'zod';

export class JsonSearchConfigurationRepository implements ISearchConfigurationRepository {
    constructor(private readonly configPath: string) {
    }

    async getAll(): Promise<SearchConfiguration[]> {
        try {
            const content = await readFile(this.configPath, 'utf-8');
            const data = JSON.parse(content);

            // Validate with Zod
            const validationResult = SearchConfigFileSchema.safeParse(data);

            if (!validationResult.success) {
                throw new ConfigurationValidationError(validationResult.error);
            }

            return validationResult.data.searches;
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                throw new Error(`❌ Fichier de configuration introuvable: ${this.configPath}`);
            }

            if (error instanceof SyntaxError) {
                throw new Error(`❌ Erreur de syntaxe JSON dans ${this.configPath}: ${error.message}`);
            }

            if (error instanceof ConfigurationValidationError) {
                throw error;
            }

            throw error;
        }
    }
}

export class ConfigurationValidationError extends Error {
    constructor(public readonly zodError: ZodError) {
        super(ConfigurationValidationError.formatZodError(zodError));
        this.name = 'ConfigurationValidationError';
    }

    private static formatZodError(error: ZodError): string {
        const errors = error.errors.map((err: any) => {
            const path = err.path.length > 0 ? `[${err.path.join('.')}]` : '';
            return `  • ${path} ${err.message}`;
        });

        return `❌ Erreur(s) de validation dans le fichier de configuration:\n\n${errors.join('\n')}\n\nVeuillez corriger ces erreurs et réessayer.`;
    }
}
