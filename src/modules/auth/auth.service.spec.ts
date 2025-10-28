import { AuthService } from '@App/modules/auth/auth.service';
import { ConfigService } from '@nestjs/config';

describe('AuthService', () => {
  let authService: AuthService;
  let configService: ConfigService;

  beforeEach(() => {
    configService = new ConfigService();
    authService = new AuthService(configService);
  });

  it('should return true if API key matches', async () => {
    const mockApiKey = 'my-secret-key';
    jest.spyOn(configService, 'get').mockReturnValue(mockApiKey);

    const result = await authService.validateApiKey('my-secret-key');

    expect(configService.get).toHaveBeenCalledWith('API_KEY');
    expect(result).toBe(true);
  });

  it('should return false if API key does not match', async () => {
    jest.spyOn(configService, 'get').mockReturnValue('expected-key');

    const result = await authService.validateApiKey('wrong-key');

    expect(configService.get).toHaveBeenCalledWith('API_KEY');
    expect(result).toBe(false);
  });

  it('should return false if config has no API_KEY set', async () => {
    jest.spyOn(configService, 'get').mockReturnValue(undefined);

    const result = await authService.validateApiKey('any-key');

    expect(configService.get).toHaveBeenCalledWith('API_KEY');
    expect(result).toBe(false);
  });
});
