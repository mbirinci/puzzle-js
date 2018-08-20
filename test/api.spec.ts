import {Api, PuzzleApi} from "../lib/api";
import {ERROR_CODES, PuzzleError} from "../lib/errors";
import {expect} from "chai";
import {Gateway} from "../lib/gateway";
import sinon from "sinon";
import * as faker from "faker";
import {mockApiConfiguration, mockGatewayConfiguration} from "./mock";


describe('Api', () => {
  it('should throw error when trying to create Gateway without decoration', () => {
    //Arrange
    const test = () => {
      const api = new Api();
    };

    //Act

    //Assert
    expect(test).to.throw(PuzzleError, (new PuzzleError(ERROR_CODES.CLASS_IS_NOT_DECORATED, Api.name)).message);
  });

  it('should decorate class with Gateway', () => {
    //Arrange
    const name = faker.random.word();

    //Act
    @PuzzleApi(mockApiConfiguration({name}))
    class Test {}

    //Assert
    expect(Test).to.haveOwnProperty('config');
    expect((Test as any).config.name).to.eq(name);
  });

  it('should set super config', () => {
    //Arrange
    const name = faker.random.word();
    const mockConfig = mockApiConfiguration({name});
    class TestApi extends Api{
      static config = mockConfig;
    }

    //Act
    const api = new TestApi();

    //Assert
    expect(api.config).to.eq(mockConfig);
  });
});
