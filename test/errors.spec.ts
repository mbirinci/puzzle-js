import faker from "faker";
import {ERROR_CODES, PuzzleError} from "../lib/errors";
import {expect} from "chai";

describe('Error', () => {
  it('should create new error with parameters', () => {
    //Act
    const err = new PuzzleError();

    //Assert
    expect(err).to.be.instanceof(PuzzleError);
  });

  it('should pass variables into error generator', () => {
    //Arrange
    const message = faker.random.word();

    //Act
    const err = new PuzzleError(ERROR_CODES.UNKNOWN, message);

    //Assert
    expect(err).to.be.instanceof(PuzzleError);
    expect(err.message).to.include(message);
  });

  it('should be throwable', () => {
    //Arrange
    const message = faker.random.word();
    const err = new PuzzleError(ERROR_CODES.UNKNOWN, message);

    //Act
    const test = () => {
      throw err;
    };

    //Assert
    expect(test).to.throw(PuzzleError, (new PuzzleError(ERROR_CODES.UNKNOWN, message)).message);
  });
});
