const SimpleStorage = artifacts.require("SimpleStorage");

contract("SimpleStorage", (accounts) => {
  it("should store and retrieve a value", async () => {
    const instance = await SimpleStorage.deployed();

    // Set value to 42
    await instance.set(42);

    // Get the value
    const value = await instance.get();

    assert.equal(value.toString(), "42", "The value should be 42");
  });

  it("should emit ValueChanged event", async () => {
    const instance = await SimpleStorage.deployed();

    // Set value and capture transaction result
    const result = await instance.set(100);

    // Check event was emitted
    assert.equal(result.logs[0].event, "ValueChanged");
    assert.equal(result.logs[0].args.newValue.toString(), "100");
  });

  it("should start with initial value of 0", async () => {
    const instance = await SimpleStorage.new();

    const value = await instance.get();

    assert.equal(value.toString(), "0", "Initial value should be 0");
  });

  it("should allow multiple value updates", async () => {
    const instance = await SimpleStorage.deployed();

    // Set first value
    await instance.set(10);
    let value = await instance.get();
    assert.equal(value.toString(), "10", "Value should be 10");

    // Set second value
    await instance.set(20);
    value = await instance.get();
    assert.equal(value.toString(), "20", "Value should be 20");

    // Set third value
    await instance.set(30);
    value = await instance.get();
    assert.equal(value.toString(), "30", "Value should be 30");
  });
});
