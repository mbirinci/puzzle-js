import {expect} from "chai";
import {PuzzleError} from "../lib/errors";

describe('Error', () => {
  it('should create new PuzzleError if error non provided', () => {
    //Arrange
    const err = new PuzzleError();
    //Assert

    expect(err).to.be.instanceof(PuzzleError);
  });
});
