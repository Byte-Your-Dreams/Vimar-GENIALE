import { Product } from "../../models/product.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

Deno.test("Product: should return the correct ID", () => {
  // Arrange
  const product = new Product("ID1", "Product A", "Description A", "ETIM A");

  // Act
  const id = product.getID();

  // Assert
  assertEquals(id, "ID1");
});

Deno.test("Product: should return the correct name", () => {
  // Arrange
  const product = new Product("ID1", "Product A", "Description A", "ETIM A");

  // Act
  const name = product.getName();

  // Assert
  assertEquals(name, "Product A");
});

Deno.test("Product: should return the correct description", () => {
  // Arrange
  const product = new Product("ID1", "Product A", "Description A", "ETIM A");

  // Act
  const description = product.getDescription();

  // Assert
  assertEquals(description, "Description A");
});

Deno.test("Product: should return the correct ETIM", () => {
  // Arrange
  const product = new Product("ID1", "Product A", "Description A", "ETIM A");

  // Act
  const etim = product.getEtim();

  // Assert
  assertEquals(etim, "ETIM A");
});

Deno.test("Product: should set and get the name correctly", () => {
  // Arrange
  const product = new Product("ID1", "Old Name", "Description A", "ETIM A");

  // Act
  product.setName("New Name");
  const name = product.getName();

  // Assert
  assertEquals(name, "New Name");
});

Deno.test("Product: should set and get the description correctly", () => {
  // Arrange
  const product = new Product("ID1", "Product A", "Old Description", "ETIM A");

  // Act
  product.setDescription("New Description");
  const description = product.getDescription();

  // Assert
  assertEquals(description, "New Description");
});